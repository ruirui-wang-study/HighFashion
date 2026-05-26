import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { internalLinkDrafts } from "./seo-automation.drafts";
import { SeoAiRuntimeService } from "./seo-ai-runtime.service";
import { asRecord, asString, mapInternalLinkSuggestion, type SeoAdminActor } from "./seo-automation.shared";
import type { InternalLinkSuggestionItem } from "./seo-automation.types";

@Injectable()
export class SeoInternalLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seoAiRuntime: SeoAiRuntimeService,
  ) {}

  async generateInternalLinkSuggestions(): Promise<InternalLinkSuggestionItem[]> {
    await this.seedInternalLinkDrafts();
    await this.enhanceInternalLinkDraftsWithAi();
    return this.listInternalLinks();
  }

  async listInternalLinks(): Promise<InternalLinkSuggestionItem[]> {
    let rows = await (this.prisma as unknown as {
      internalLinkSuggestion: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).internalLinkSuggestion.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) {
      await this.seedInternalLinkDrafts();
      rows = await (this.prisma as unknown as {
        internalLinkSuggestion: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
      }).internalLinkSuggestion.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });
    }

    return rows.map((row) => mapInternalLinkSuggestion(row));
  }

  async applyInternalLinkSuggestion(id: string, actor: SeoAdminActor) {
    let suggestion = await (this.prisma as unknown as {
      internalLinkSuggestion: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).internalLinkSuggestion.findUnique({ where: { id } });
    if (!suggestion) {
      await this.generateInternalLinkSuggestions();
      suggestion = await (this.prisma as unknown as {
        internalLinkSuggestion: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
      }).internalLinkSuggestion.findUnique({ where: { id } });
    }
    if (!suggestion) {
      throw new NotFoundException({ code: "INTERNAL_LINK_SUGGESTION_NOT_FOUND", message: "Internal link suggestion not found" });
    }

    const mappedSuggestion = mapInternalLinkSuggestion(suggestion);
    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminId,
        action: "INTERNAL_LINK_APPLIED",
        resource: "internal_link_suggestion",
        resourceId: id,
        details: {
          actorEmail: actor.adminEmail,
          sourcePage: mappedSuggestion.sourcePage,
          targetPage: mappedSuggestion.targetPage,
          anchorText: mappedSuggestion.anchorText,
        },
      },
    });

    await (this.prisma as unknown as {
      seoChangeLog: { create: (args: unknown) => Promise<unknown> };
    }).seoChangeLog.create({
      data: {
        action: "INTERNAL_LINK_APPLIED",
        resourceType: "internal_link",
        resourceId: id,
        oldValue: null,
        newValue: mappedSuggestion,
        operatorId: actor.adminId,
      },
    });

    const updated = await (this.prisma as unknown as {
      internalLinkSuggestion: { update: (args: unknown) => Promise<Record<string, unknown>> };
    }).internalLinkSuggestion.update({
      where: { id },
      data: { status: "APPLIED" },
    });

    return mapInternalLinkSuggestion(updated);
  }

  private async seedInternalLinkDrafts() {
    for (const draft of internalLinkDrafts) {
      await (this.prisma as unknown as {
        internalLinkSuggestion: { upsert: (args: unknown) => Promise<unknown> };
      }).internalLinkSuggestion.upsert({
        where: { id: draft.id },
        update: {
          sourcePage: draft.sourcePage,
          targetPage: draft.targetPage,
          anchorText: draft.anchorText,
          reason: draft.reason,
          priority: draft.priority,
        },
        create: {
          id: draft.id,
          sourcePage: draft.sourcePage,
          targetPage: draft.targetPage,
          anchorText: draft.anchorText,
          reason: draft.reason,
          priority: draft.priority,
          status: "NEW",
        },
      });
    }
  }

  private async enhanceInternalLinkDraftsWithAi() {
    const items = await this.seoAiRuntime.rewriteInternalLinkDrafts(
      internalLinkDrafts.map((draft) => ({
        id: draft.id,
        sourcePage: draft.sourcePage,
        targetPage: draft.targetPage,
        currentAnchorText: draft.anchorText,
        currentReason: draft.reason,
        priority: draft.priority,
      })),
    );

    for (const item of items) {
      const record = asRecord(item);
      const id = asString(record.id);
      const anchorText = asString(record.anchorText);
      const reason = asString(record.reason);
      if (!id || (!anchorText && !reason)) continue;

      await (this.prisma as unknown as {
        internalLinkSuggestion: { update: (args: unknown) => Promise<unknown> };
      }).internalLinkSuggestion.update({
        where: { id },
        data: {
          ...(anchorText ? { anchorText } : {}),
          ...(reason ? { reason } : {}),
        },
      });
    }
  }
}
