import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { FeishuClient } from "./feishu/feishu.client";

@Injectable()
export class OrderInventoryAlertService {
  private readonly logger = new Logger(OrderInventoryAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly feishu: FeishuClient,
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

    const result = await this.feishu.sendTextMessage(lines.join("\n"));
    this.logger.log(
      JSON.stringify({
        event: "inventory_short_alert_sent",
        orderId: order.id,
        orderNo: order.orderNo,
        mode: result.mode,
        delivered: result.delivered,
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
