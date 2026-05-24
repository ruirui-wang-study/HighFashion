import { Injectable, NotFoundException } from "@nestjs/common";
import { ContentStatus, ContentType, type Prisma } from "@prisma/client";
import { guides } from "../../../data/guides";
import { faqs } from "../../../data/faq";
import { PrismaService } from "../common/prisma.service";
import type { UpdateFaqDto } from "./dto/update-faq.dto";
import type { UpsertGuideDto } from "./dto/upsert-guide.dto";
import type { AdminActor, FaqPayload, GuidePayload } from "./admin-content.types";

const guideInclude = { guideContent: true } satisfies Prisma.ContentEntryInclude;
const faqInclude = { faqContent: true } satisfies Prisma.ContentEntryInclude;

@Injectable()
export class AdminContentService {
  constructor(private readonly prisma: PrismaService) {}

  async listGuides(status?: ContentStatus) {
    const guides = await this.prisma.contentEntry.findMany({
      where: {
        type: ContentType.GUIDE,
        ...(status ? { status } : {}),
      },
      include: guideInclude,
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });

    return guides.map(mapGuideEntry);
  }

  async getGuideById(id: string) {
    const guide = await this.prisma.contentEntry.findUnique({ where: { id }, include: guideInclude });
    if (!guide || guide.type !== ContentType.GUIDE || !guide.guideContent) {
      throw new NotFoundException({ code: "GUIDE_NOT_FOUND", message: "Guide not found" });
    }
    return mapGuideEntry(guide);
  }

  async createGuide(actor: AdminActor, input: UpsertGuideDto) {
    const guide = await this.prisma.$transaction(async (tx) => {
      const created = await tx.contentEntry.create({
        data: {
          type: ContentType.GUIDE,
          title: input.title.trim(),
          slug: input.slug.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoDescription: normalizeNullableString(input.seoDescription),
          publishedAt: input.status === ContentStatus.PUBLISHED ? new Date() : null,
          guideContent: { create: buildGuideContentData(input) },
        },
        include: guideInclude,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "CONTENT_CREATED",
          resource: "content_entry",
          resourceId: created.id,
          details: {
            title: created.title,
            slug: created.slug,
            type: created.type,
            status: created.status,
            actorEmail: actor.adminEmail,
          },
        },
      });

      return created;
    });

    return mapGuideEntry(guide);
  }

  async updateGuide(id: string, actor: AdminActor, input: UpsertGuideDto) {
    const updated = await this.prisma.$transaction(async (tx) => {
      await assertGuideExists(tx, id);
      const guide = await tx.contentEntry.update({
        where: { id },
        data: {
          title: input.title.trim(),
          slug: input.slug.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoDescription: normalizeNullableString(input.seoDescription),
          publishedAt: input.status === ContentStatus.PUBLISHED ? new Date() : null,
          guideContent: {
            upsert: {
              update: buildGuideContentData(input),
              create: buildGuideContentData(input),
            },
          },
        },
        include: guideInclude,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "CONTENT_UPDATED",
          resource: "content_entry",
          resourceId: id,
          details: {
            title: guide.title,
            slug: guide.slug,
            status: guide.status,
            actorEmail: actor.adminEmail,
          },
        },
      });

      return guide;
    });

    return mapGuideEntry(updated);
  }

  async publishGuide(id: string, actor: AdminActor) {
    return this.transitionGuide(id, actor, ContentStatus.PUBLISHED, "CONTENT_PUBLISHED");
  }

  async archiveGuide(id: string, actor: AdminActor) {
    return this.transitionGuide(id, actor, ContentStatus.ARCHIVED, "CONTENT_ARCHIVED");
  }

  async moveGuideToDraft(id: string, actor: AdminActor) {
    return this.transitionGuide(id, actor, ContentStatus.DRAFT, "CONTENT_DRAFTED");
  }

  async getFaq() {
    const entry = await this.prisma.contentEntry.findFirst({
      where: { type: ContentType.FAQ },
      include: faqInclude,
      orderBy: { updatedAt: "desc" },
    });

    if (!entry || !entry.faqContent) {
      return {
        id: "",
        title: "FAQ",
        slug: "faq",
        status: ContentStatus.PUBLISHED,
        seoTitle: "FAQ | PulseGear",
        seoDescription: "Frequently asked questions about PulseGear orders, shipping, and fit.",
        items: faqs,
        updatedAt: new Date().toISOString(),
      } satisfies FaqPayload;
    }

    return mapFaqEntry(entry);
  }

  async updateFaq(actor: AdminActor, input: UpdateFaqDto) {
    const entry = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.contentEntry.upsert({
        where: { type_slug: { type: ContentType.FAQ, slug: input.slug.trim() } },
        update: {
          title: input.title.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoDescription: normalizeNullableString(input.seoDescription),
          publishedAt: input.status === ContentStatus.PUBLISHED ? new Date() : null,
          faqContent: {
            upsert: {
              update: { items: input.items as unknown as Prisma.InputJsonValue },
              create: { items: input.items as unknown as Prisma.InputJsonValue },
            },
          },
        },
        create: {
          type: ContentType.FAQ,
          title: input.title.trim(),
          slug: input.slug.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoDescription: normalizeNullableString(input.seoDescription),
          publishedAt: input.status === ContentStatus.PUBLISHED ? new Date() : null,
          faqContent: {
            create: { items: input.items as unknown as Prisma.InputJsonValue },
          },
        },
        include: faqInclude,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "FAQ_UPDATED",
          resource: "content_entry",
          resourceId: saved.id,
          details: {
            title: saved.title,
            slug: saved.slug,
            status: saved.status,
            actorEmail: actor.adminEmail,
          },
        },
      });

      return saved;
    });

    return mapFaqEntry(entry);
  }

  async listPublishedGuides() {
    const entries = await this.prisma.contentEntry.findMany({
      where: { type: ContentType.GUIDE, status: ContentStatus.PUBLISHED },
      include: guideInclude,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    });
    return entries.map(mapGuideEntry);
  }

  async getPublishedGuideBySlug(slug: string) {
    const entry = await this.prisma.contentEntry.findFirst({
      where: { type: ContentType.GUIDE, status: ContentStatus.PUBLISHED, slug },
      include: guideInclude,
    });
    return entry ? mapGuideEntry(entry) : null;
  }

  async importGuidesFromStaticData() {
    const count = await this.prisma.contentEntry.count({ where: { type: ContentType.GUIDE } });
    if (count > 0) return;

    for (const guide of guides) {
      await this.prisma.contentEntry.create({
        data: {
          type: ContentType.GUIDE,
          title: guide.title,
          slug: guide.slug,
          status: ContentStatus.PUBLISHED,
          seoTitle: guide.metaTitle,
          seoDescription: guide.metaDescription,
          publishedAt: new Date(guide.publishedAt),
          guideContent: {
            create: {
              dek: guide.dek,
              category: guide.category,
              authorName: guide.author.name,
              authorRole: guide.author.role,
              readTime: guide.readTime,
              sections: guide.sections as Prisma.InputJsonValue,
              faq: guide.faq as Prisma.InputJsonValue,
              relatedProducts: guide.relatedProducts as Prisma.InputJsonValue,
              relatedCollections: guide.relatedCollections as Prisma.InputJsonValue,
              relatedGuides: guide.relatedGuides as Prisma.InputJsonValue,
            },
          },
        },
      });
    }
  }

  private async transitionGuide(id: string, actor: AdminActor, status: ContentStatus, action: string) {
    const guide = await this.prisma.$transaction(async (tx) => {
      await assertGuideExists(tx, id);
      const updated = await tx.contentEntry.update({
        where: { id },
        data: {
          status,
          publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
        },
        include: guideInclude,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action,
          resource: "content_entry",
          resourceId: id,
          details: {
            title: updated.title,
            slug: updated.slug,
            status: updated.status,
            actorEmail: actor.adminEmail,
          },
        },
      });

      return updated;
    });

    return mapGuideEntry(guide);
  }
}

async function assertGuideExists(tx: Prisma.TransactionClient, id: string) {
  const existing = await tx.contentEntry.findUnique({ where: { id } });
  if (!existing || existing.type !== ContentType.GUIDE) {
    throw new NotFoundException({ code: "GUIDE_NOT_FOUND", message: "Guide not found" });
  }
}

function buildGuideContentData(input: UpsertGuideDto) {
  return {
    dek: input.dek.trim(),
    category: input.category.trim(),
    authorName: input.authorName.trim(),
    authorRole: input.authorRole.trim(),
    readTime: input.readTime.trim(),
    sections: input.sections as unknown as Prisma.InputJsonValue,
    faq: input.faq as unknown as Prisma.InputJsonValue,
    relatedProducts: input.relatedProducts as unknown as Prisma.InputJsonValue,
    relatedCollections: input.relatedCollections as unknown as Prisma.InputJsonValue,
    relatedGuides: input.relatedGuides as unknown as Prisma.InputJsonValue,
  };
}

function normalizeNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mapGuideEntry(
  entry: Prisma.ContentEntryGetPayload<{ include: typeof guideInclude }>,
): GuidePayload {
  if (!entry.guideContent) {
    throw new NotFoundException({ code: "GUIDE_CONTENT_NOT_FOUND", message: "Guide content not found" });
  }

  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    status: entry.status,
    seoTitle: entry.seoTitle ?? null,
    seoDescription: entry.seoDescription ?? null,
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    updatedAt: entry.updatedAt.toISOString(),
    dek: entry.guideContent.dek,
    category: entry.guideContent.category,
    authorName: entry.guideContent.authorName,
    authorRole: entry.guideContent.authorRole,
    readTime: entry.guideContent.readTime,
    sections: entry.guideContent.sections as GuidePayload["sections"],
    faq: entry.guideContent.faq as GuidePayload["faq"],
    relatedProducts: entry.guideContent.relatedProducts as string[],
    relatedCollections: entry.guideContent.relatedCollections as GuidePayload["relatedCollections"],
    relatedGuides: entry.guideContent.relatedGuides as string[],
  };
}

function mapFaqEntry(entry: Prisma.ContentEntryGetPayload<{ include: typeof faqInclude }>): FaqPayload {
  if (!entry.faqContent) {
    throw new NotFoundException({ code: "FAQ_NOT_FOUND", message: "FAQ not found" });
  }

  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    status: entry.status,
    seoTitle: entry.seoTitle ?? null,
    seoDescription: entry.seoDescription ?? null,
    items: entry.faqContent.items as FaqPayload["items"],
    updatedAt: entry.updatedAt.toISOString(),
  };
}
