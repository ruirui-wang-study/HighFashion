import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import type { SeoChangeLogItem } from "./seo-automation.types";

@Injectable()
export class SeoChangeLogService {
  constructor(private readonly prisma: PrismaService) {}

  async listChangeLog(): Promise<SeoChangeLogItem[]> {
    const rows = await (this.prisma as unknown as {
      seoChangeLog: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).seoChangeLog.findMany({
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      id: String(row.id),
      action: String(row.action),
      resourceType: String(row.resourceType),
      resourceId: row.resourceId ? String(row.resourceId) : null,
      operatorId: row.operatorId ? String(row.operatorId) : null,
      createdAt: new Date(row.createdAt as string | Date).toISOString(),
    }));
  }
}
