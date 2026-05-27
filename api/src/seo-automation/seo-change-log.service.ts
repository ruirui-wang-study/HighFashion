import { Injectable } from "@nestjs/common";
import { paginatedResult, resolvePagination } from "../common/pagination";
import { PrismaService } from "../common/prisma.service";
import type { SeoChangeLogItem } from "./seo-automation.types";

@Injectable()
export class SeoChangeLogService {
  constructor(private readonly prisma: PrismaService) {}

  async listChangeLog(page?: number, pageSize?: number) {
    const pagination = resolvePagination(page, pageSize, 50);
    const model = (this.prisma as unknown as {
      seoChangeLog: {
        count: (args: unknown) => Promise<number>;
        findMany: (args: unknown) => Promise<Array<Record<string, unknown>>>;
      };
    }).seoChangeLog;

    const [total, rows] = await Promise.all([
      model.count({}),
      model.findMany({
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.pageSize,
      }),
    ]);

    const items: SeoChangeLogItem[] = rows.map((row) => ({
      id: String(row.id),
      action: String(row.action),
      resourceType: String(row.resourceType),
      resourceId: row.resourceId ? String(row.resourceId) : null,
      operatorId: row.operatorId ? String(row.operatorId) : null,
      createdAt: new Date(row.createdAt as string | Date).toISOString(),
    }));

    return paginatedResult(items, total, pagination.page, pagination.pageSize);
  }
}
