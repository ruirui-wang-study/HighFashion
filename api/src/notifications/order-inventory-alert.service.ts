import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { NotificationOutboxService } from "./notification-outbox.service";

@Injectable()
export class OrderInventoryAlertService {
  private readonly logger = new Logger(OrderInventoryAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: NotificationOutboxService,
    private readonly config: ConfigService,
  ) {}

  notifyInventoryShort(orderId: string) {
    void this.deliverInventoryShortAlert(orderId).catch((error) => {
      this.logger.error(
        JSON.stringify({
          event: "inventory_short_alert_failed",
          orderId,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    });
  }

  notifyInventoryDrift(rows: Array<{ variantId: string; from: number; to: number }>) {
    void this.deliverInventoryDriftAlert(rows).catch((error) => {
      this.logger.error(
        JSON.stringify({
          event: "inventory_drift_alert_failed",
          count: rows.length,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    });
  }

  private async deliverInventoryShortAlert(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { orderBy: { id: "asc" } } },
    });
    if (!order || order.inventoryStatus !== "SHORT") return;

    const adminBaseUrl = await this.resolveAdminBaseUrl();
    const lines = [
      "【PulseGear 库存告警】订单已付款，但库存确认失败",
      `订单号：${order.orderNo}`,
      `订单 ID：${order.id}`,
      `金额：${formatMoney(order.totalCents, order.currency)}`,
      `邮箱：${order.email ?? "—"}`,
      "商品明细：",
      ...order.items.map(
        (item) => `- ${item.titleSnapshot} / ${item.colorSnapshot} / ${item.sizeSnapshot} × ${item.quantity}（SKU: ${item.skuSnapshot}）`,
      ),
      `后台处理：${adminBaseUrl}/admin/orders/${order.id}`,
      "建议：尽快退款、换货或紧急补货并核对库存流水。",
    ];

    const text = lines.join("\n");
    await this.outbox.enqueueFeishu("inventory.short", text, `inventory-short:${order.id}`);
    this.logger.log(
      JSON.stringify({
        event: "inventory_short_alert_queued",
        orderId: order.id,
        orderNo: order.orderNo,
      }),
    );
  }

  private async deliverInventoryDriftAlert(rows: Array<{ variantId: string; from: number; to: number }>) {
    if (rows.length === 0) return;

    const adminBaseUrl = await this.resolveAdminBaseUrl();
    const lines = [
      "【PulseGear 库存对账告警】检测到 reservedStock 漂移并已自动修正",
      `修正数量：${rows.length}`,
      "明细（最多 20 条）：",
      ...rows.slice(0, 20).map((row) => `- variantId=${row.variantId} : ${row.from} -> ${row.to}`),
      `后台排查入口：${adminBaseUrl}/admin/inventory`,
      "建议：检查近期 RESERVATION/RELEASE/SALE 流水是否异常重放或遗漏。",
    ];
    if (rows.length > 20) {
      lines.push(`... 其余 ${rows.length - 20} 条请查看 api.log（event=inventory_reserved_stock_reconciled）`);
    }

    const text = lines.join("\n");
    const dedupeSuffix = rows
      .slice(0, 20)
      .map((row) => `${row.variantId}:${row.from}->${row.to}`)
      .join("|");
    await this.outbox.enqueueFeishu("inventory.drift", text, `inventory-drift:${dedupeSuffix}`);
    this.logger.log(
      JSON.stringify({
        event: "inventory_drift_alert_queued",
        count: rows.length,
      }),
    );
  }

  private async resolveAdminBaseUrl() {
    const settings = await this.prisma.adminSettings.findUnique({ where: { id: "default" } });
    const configured = settings?.storefrontUrl?.trim() || this.config.get<string>("FRONTEND_URL")?.trim();
    return (configured || "http://localhost:3000").replace(/\/$/, "");
  }
}

function formatMoney(totalCents: number, currency: string) {
  const amount = (totalCents / 100).toFixed(2);
  return `${amount} ${currency.toUpperCase()}`;
}
