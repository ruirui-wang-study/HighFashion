import { Injectable, NotFoundException } from "@nestjs/common";
import { ContentStatus, ContentType, Prisma, type Prisma as PrismaNamespace } from "@prisma/client";
import { baseCollectionPages, collectionLandingPages } from "../../../data/collection-pages";
import { guides } from "../../../data/guides";
import { faqs } from "../../../data/faq";
import { managedStaticPages, type StaticPageKey } from "../../../data/static-pages";
import { PrismaService } from "../common/prisma.service";
import type { UpdateCollectionLandingDto } from "./dto/update-collection-landing.dto";
import type { UpdateFaqDto } from "./dto/update-faq.dto";
import type { UpdateStaticPageDto } from "./dto/update-static-page.dto";
import type { UpsertGuideDto } from "./dto/upsert-guide.dto";
import type { AdminActor, CollectionLandingPayload, FaqPayload, GuidePayload, StaticPagePayload } from "./admin-content.types";

const guideInclude = { guideContent: true } satisfies PrismaNamespace.ContentEntryInclude;
const faqInclude = { faqContent: true } satisfies PrismaNamespace.ContentEntryInclude;
const collectionInclude = { collectionLandingContent: true } satisfies PrismaNamespace.ContentEntryInclude;
const staticInclude = { staticPageContent: true } satisfies PrismaNamespace.ContentEntryInclude;

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
          titleEn: normalizeNullableString(input.titleEn) ?? input.title.trim(),
          titleZh: normalizeNullableString(input.titleZh),
          slug: input.slug.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoTitleEn: normalizeNullableString(input.seoTitleEn) ?? normalizeNullableString(input.seoTitle),
          seoTitleZh: normalizeNullableString(input.seoTitleZh),
          seoDescription: normalizeNullableString(input.seoDescription),
          seoDescriptionEn: normalizeNullableString(input.seoDescriptionEn) ?? normalizeNullableString(input.seoDescription),
          seoDescriptionZh: normalizeNullableString(input.seoDescriptionZh),
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
          titleEn: normalizeNullableString(input.titleEn) ?? input.title.trim(),
          titleZh: normalizeNullableString(input.titleZh),
          slug: input.slug.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoTitleEn: normalizeNullableString(input.seoTitleEn) ?? normalizeNullableString(input.seoTitle),
          seoTitleZh: normalizeNullableString(input.seoTitleZh),
          seoDescription: normalizeNullableString(input.seoDescription),
          seoDescriptionEn: normalizeNullableString(input.seoDescriptionEn) ?? normalizeNullableString(input.seoDescription),
          seoDescriptionZh: normalizeNullableString(input.seoDescriptionZh),
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
        titleEn: "FAQ",
        titleZh: null,
        slug: "faq",
        status: ContentStatus.PUBLISHED,
        seoTitle: "FAQ | PulseGear",
        seoTitleEn: "FAQ | PulseGear",
        seoTitleZh: null,
        seoDescription: "Frequently asked questions about PulseGear orders, shipping, and fit.",
        seoDescriptionEn: "Frequently asked questions about PulseGear orders, shipping, and fit.",
        seoDescriptionZh: null,
        items: faqs,
        itemsEn: faqs,
        itemsZh: [],
        updatedAt: new Date().toISOString(),
      } satisfies FaqPayload;
    }

    return mapFaqEntry(entry);
  }

  async listCollectionLandings() {
    await this.importCollectionPagesFromStaticData();
    const entries = await this.prisma.contentEntry.findMany({
      where: { type: ContentType.COLLECTION_PAGE },
      include: collectionInclude,
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });
    return entries.map(mapCollectionLandingEntry);
  }

  async getCollectionLandingById(id: string) {
    await this.importCollectionPagesFromStaticData();
    const entry = await this.prisma.contentEntry.findUnique({ where: { id }, include: collectionInclude });
    if (!entry || entry.type !== ContentType.COLLECTION_PAGE || !entry.collectionLandingContent) {
      throw new NotFoundException({ code: "COLLECTION_LANDING_NOT_FOUND", message: "Collection landing not found" });
    }
    return mapCollectionLandingEntry(entry);
  }

  async listStaticPages() {
    await this.importStaticPagesFromDefaults();
    const entries = await this.prisma.contentEntry.findMany({
      where: { type: ContentType.STATIC_PAGE },
      include: staticInclude,
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });
    return entries.map(mapStaticPageEntry);
  }

  async getStaticPageById(id: string) {
    await this.importStaticPagesFromDefaults();
    const entry = await this.prisma.contentEntry.findUnique({ where: { id }, include: staticInclude });
    if (!entry || entry.type !== ContentType.STATIC_PAGE || !entry.staticPageContent) {
      throw new NotFoundException({ code: "STATIC_PAGE_NOT_FOUND", message: "Static page not found" });
    }
    return mapStaticPageEntry(entry);
  }

  async updateCollectionLanding(id: string, actor: AdminActor, input: UpdateCollectionLandingDto) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.contentEntry.findUnique({ where: { id }, include: collectionInclude });
      if (!existing || existing.type !== ContentType.COLLECTION_PAGE || !existing.collectionLandingContent) {
        throw new NotFoundException({ code: "COLLECTION_LANDING_NOT_FOUND", message: "Collection landing not found" });
      }

      const entry = await tx.contentEntry.update({
        where: { id },
        data: {
          title: input.title.trim(),
          titleEn: normalizeNullableString(input.titleEn) ?? input.title.trim(),
          titleZh: normalizeNullableString(input.titleZh),
          slug: input.slug.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoTitleEn: normalizeNullableString(input.seoTitleEn) ?? normalizeNullableString(input.seoTitle),
          seoTitleZh: normalizeNullableString(input.seoTitleZh),
          seoDescription: normalizeNullableString(input.seoDescription),
          seoDescriptionEn: normalizeNullableString(input.seoDescriptionEn) ?? normalizeNullableString(input.seoDescription),
          seoDescriptionZh: normalizeNullableString(input.seoDescriptionZh),
          publishedAt: input.status === ContentStatus.PUBLISHED ? (existing.publishedAt ?? new Date()) : null,
          collectionLandingContent: {
            upsert: {
              update: {
                pathname: input.pathname.trim(),
                scenario: normalizeNullableString(input.scenario),
                intro: normalizeNullableString(input.intro),
                introEn: normalizeNullableString(input.introEn) ?? normalizeNullableString(input.intro),
                introZh: normalizeNullableString(input.introZh),
                category: normalizeNullableString(input.category),
                useCase: normalizeNullableString(input.useCase),
                relatedGuideSlugs: input.relatedGuideSlugs as unknown as Prisma.InputJsonValue,
              },
              create: {
                pathname: input.pathname.trim(),
                scenario: normalizeNullableString(input.scenario),
                intro: normalizeNullableString(input.intro),
                introEn: normalizeNullableString(input.introEn) ?? normalizeNullableString(input.intro),
                introZh: normalizeNullableString(input.introZh),
                category: normalizeNullableString(input.category),
                useCase: normalizeNullableString(input.useCase),
                relatedGuideSlugs: input.relatedGuideSlugs as unknown as Prisma.InputJsonValue,
              },
            },
          },
        },
        include: collectionInclude,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "COLLECTION_LANDING_UPDATED",
          resource: "content_entry",
          resourceId: id,
          details: {
            title: entry.title,
            pathname: entry.collectionLandingContent?.pathname,
            status: entry.status,
            actorEmail: actor.adminEmail,
          },
        },
      });

      return entry;
    });

    return mapCollectionLandingEntry(updated);
  }

  async updateStaticPage(id: string, actor: AdminActor, input: UpdateStaticPageDto) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.contentEntry.findUnique({ where: { id }, include: staticInclude });
      if (!existing || existing.type !== ContentType.STATIC_PAGE || !existing.staticPageContent) {
        throw new NotFoundException({ code: "STATIC_PAGE_NOT_FOUND", message: "Static page not found" });
      }

      const entry = await tx.contentEntry.update({
        where: { id },
        data: {
          title: input.title.trim(),
          titleEn: normalizeNullableString(input.titleEn) ?? input.title.trim(),
          titleZh: normalizeNullableString(input.titleZh),
          slug: input.slug.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoTitleEn: normalizeNullableString(input.seoTitleEn) ?? normalizeNullableString(input.seoTitle),
          seoTitleZh: normalizeNullableString(input.seoTitleZh),
          seoDescription: normalizeNullableString(input.seoDescription),
          seoDescriptionEn: normalizeNullableString(input.seoDescriptionEn) ?? normalizeNullableString(input.seoDescription),
          seoDescriptionZh: normalizeNullableString(input.seoDescriptionZh),
          publishedAt: input.status === ContentStatus.PUBLISHED ? (existing.publishedAt ?? new Date()) : null,
          staticPageContent: {
            upsert: {
              update: {
                pageKey: input.pageKey,
                pathname: input.pathname.trim(),
                content: input.content as Prisma.InputJsonValue,
                contentEn: (input.contentEn ?? input.content) as Prisma.InputJsonValue,
                contentZh: toNullableJsonInput(input.contentZh ?? null),
              },
              create: {
                pageKey: input.pageKey,
                pathname: input.pathname.trim(),
                content: input.content as Prisma.InputJsonValue,
                contentEn: (input.contentEn ?? input.content) as Prisma.InputJsonValue,
                contentZh: toNullableJsonInput(input.contentZh ?? null),
              },
            },
          },
        },
        include: staticInclude,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "STATIC_PAGE_UPDATED",
          resource: "content_entry",
          resourceId: id,
          details: {
            pageKey: entry.staticPageContent?.pageKey,
            title: entry.title,
            pathname: entry.staticPageContent?.pathname,
            status: entry.status,
            actorEmail: actor.adminEmail,
          },
        },
      });

      return entry;
    });

    return mapStaticPageEntry(updated);
  }

  async updateFaq(actor: AdminActor, input: UpdateFaqDto) {
    const entry = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.contentEntry.upsert({
        where: { type_slug: { type: ContentType.FAQ, slug: input.slug.trim() } },
        update: {
          title: input.title.trim(),
          titleEn: normalizeNullableString(input.titleEn) ?? input.title.trim(),
          titleZh: normalizeNullableString(input.titleZh),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoTitleEn: normalizeNullableString(input.seoTitleEn) ?? normalizeNullableString(input.seoTitle),
          seoTitleZh: normalizeNullableString(input.seoTitleZh),
          seoDescription: normalizeNullableString(input.seoDescription),
          seoDescriptionEn: normalizeNullableString(input.seoDescriptionEn) ?? normalizeNullableString(input.seoDescription),
          seoDescriptionZh: normalizeNullableString(input.seoDescriptionZh),
          publishedAt: input.status === ContentStatus.PUBLISHED ? new Date() : null,
          faqContent: {
            upsert: {
              update: {
                items: input.items as unknown as Prisma.InputJsonValue,
                itemsEn: input.itemsEn as unknown as Prisma.InputJsonValue,
                itemsZh: input.itemsZh as unknown as Prisma.InputJsonValue,
              },
              create: {
                items: input.items as unknown as Prisma.InputJsonValue,
                itemsEn: input.itemsEn as unknown as Prisma.InputJsonValue,
                itemsZh: input.itemsZh as unknown as Prisma.InputJsonValue,
              },
            },
          },
        },
        create: {
          type: ContentType.FAQ,
          title: input.title.trim(),
          titleEn: normalizeNullableString(input.titleEn) ?? input.title.trim(),
          titleZh: normalizeNullableString(input.titleZh),
          slug: input.slug.trim(),
          status: input.status,
          seoTitle: normalizeNullableString(input.seoTitle),
          seoTitleEn: normalizeNullableString(input.seoTitleEn) ?? normalizeNullableString(input.seoTitle),
          seoTitleZh: normalizeNullableString(input.seoTitleZh),
          seoDescription: normalizeNullableString(input.seoDescription),
          seoDescriptionEn: normalizeNullableString(input.seoDescriptionEn) ?? normalizeNullableString(input.seoDescription),
          seoDescriptionZh: normalizeNullableString(input.seoDescriptionZh),
          publishedAt: input.status === ContentStatus.PUBLISHED ? new Date() : null,
          faqContent: {
            create: {
              items: input.items as unknown as Prisma.InputJsonValue,
              itemsEn: input.itemsEn as unknown as Prisma.InputJsonValue,
              itemsZh: input.itemsZh as unknown as Prisma.InputJsonValue,
            },
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

  async listPublishedGuides(locale: "en" | "zh" = "en") {
    const entries = await this.prisma.contentEntry.findMany({
      where: { type: ContentType.GUIDE, status: ContentStatus.PUBLISHED },
      include: guideInclude,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    });
    return entries.map((entry) => mapLocalizedGuideEntry(entry, locale));
  }

  async getPublishedGuideBySlug(slug: string, locale: "en" | "zh" = "en") {
    const entry = await this.prisma.contentEntry.findFirst({
      where: { type: ContentType.GUIDE, status: ContentStatus.PUBLISHED, slug },
      include: guideInclude,
    });
    return entry ? mapLocalizedGuideEntry(entry, locale) : null;
  }

  async getPublishedFaq(locale: "en" | "zh" = "en") {
    const entry = await this.prisma.contentEntry.findFirst({
      where: { type: ContentType.FAQ, status: ContentStatus.PUBLISHED },
      include: faqInclude,
      orderBy: { updatedAt: "desc" },
    });

    if (!entry || !entry.faqContent) {
      return locale === "zh"
        ? {
            title: "常见问题",
            seoTitle: "常见问题 | PulseGear",
            seoDescription: "查看 PulseGear 关于配送、退货、尺码和结账的常见问题。",
            items: [],
          }
        : {
            title: "FAQ",
            seoTitle: "FAQ | PulseGear",
            seoDescription: "Frequently asked questions about PulseGear orders, shipping, and fit.",
            items: faqs,
          };
    }

    return mapLocalizedFaqEntry(entry, locale);
  }

  async getPublishedCollectionLandingByPathname(pathname: string, locale: "en" | "zh" = "en") {
    await this.importCollectionPagesFromStaticData();
    const entry = await this.prisma.contentEntry.findFirst({
      where: {
        type: ContentType.COLLECTION_PAGE,
        status: ContentStatus.PUBLISHED,
        collectionLandingContent: { pathname },
      },
      include: collectionInclude,
    });
    return entry && entry.collectionLandingContent ? mapLocalizedCollectionLandingEntry(entry, locale) : null;
  }

  async getPublishedStaticPageByPathname(pathname: string, locale: "en" | "zh" = "en") {
    await this.importStaticPagesFromDefaults();
    const entry = await this.prisma.contentEntry.findFirst({
      where: {
        type: ContentType.STATIC_PAGE,
        status: ContentStatus.PUBLISHED,
        staticPageContent: { is: { pathname } },
      },
      include: staticInclude,
    });
    return entry && entry.staticPageContent ? mapLocalizedStaticPageEntry(entry, locale) : null;
  }

  async importGuidesFromStaticData() {
    const count = await this.prisma.contentEntry.count({ where: { type: ContentType.GUIDE } });
    if (count > 0) return;

    for (const guide of guides) {
      await this.prisma.contentEntry.create({
        data: {
          type: ContentType.GUIDE,
          title: guide.title,
          titleEn: guide.title,
          slug: guide.slug,
          status: ContentStatus.PUBLISHED,
          seoTitle: guide.metaTitle,
          seoTitleEn: guide.metaTitle,
          seoDescription: guide.metaDescription,
          seoDescriptionEn: guide.metaDescription,
          publishedAt: new Date(guide.publishedAt),
          guideContent: {
            create: {
              dek: guide.dek,
              dekEn: guide.dek,
              category: guide.category,
              categoryEn: guide.category,
              authorName: guide.author.name,
              authorRole: guide.author.role,
              authorRoleEn: guide.author.role,
              readTime: guide.readTime,
              readTimeEn: guide.readTime,
              sections: guide.sections as Prisma.InputJsonValue,
              sectionsEn: guide.sections as Prisma.InputJsonValue,
              faq: guide.faq as Prisma.InputJsonValue,
              faqEn: guide.faq as Prisma.InputJsonValue,
              relatedProducts: guide.relatedProducts as Prisma.InputJsonValue,
              relatedCollections: guide.relatedCollections as Prisma.InputJsonValue,
              relatedGuides: guide.relatedGuides as Prisma.InputJsonValue,
            },
          },
        },
      });
    }
  }

  async importCollectionPagesFromStaticData() {
    const count = await this.prisma.contentEntry.count({ where: { type: ContentType.COLLECTION_PAGE } });
    if (count > 0) return;

    const pages = [
      ...Object.values(baseCollectionPages).map((page) => ({
        slug: page.slug,
        pathname: `/collections/${page.slug}`,
        scenario: null,
        title: page.title,
        description: page.description,
        intro: page.intro,
        category: page.category,
        useCase: null,
        relatedGuideSlugs: page.relatedGuideSlugs,
        updatedAt: page.updatedAt,
      })),
      ...collectionLandingPages.map((page) => ({
        slug: page.slug,
        pathname: page.pathname,
        scenario: page.scenario,
        title: page.title,
        description: page.description,
        intro: page.intro,
        category: page.category ?? null,
        useCase: page.useCase ?? null,
        relatedGuideSlugs: page.relatedGuideSlugs,
        updatedAt: page.updatedAt,
      })),
    ];

    for (const page of pages) {
      await this.prisma.contentEntry.create({
        data: {
          type: ContentType.COLLECTION_PAGE,
          title: page.title,
          titleEn: page.title,
          slug: page.slug,
          status: ContentStatus.PUBLISHED,
          seoTitle: page.title,
          seoTitleEn: page.title,
          seoDescription: page.description,
          seoDescriptionEn: page.description,
          publishedAt: new Date(page.updatedAt),
          collectionLandingContent: {
            create: {
              pathname: page.pathname,
              scenario: page.scenario,
              intro: page.intro,
              introEn: page.intro,
              category: page.category,
              useCase: page.useCase,
              relatedGuideSlugs: page.relatedGuideSlugs as Prisma.InputJsonValue,
            },
          },
        },
      });
    }
  }

  async importStaticPagesFromDefaults() {
    const existingEntries = await this.prisma.contentEntry.findMany({
      where: { type: ContentType.STATIC_PAGE },
      include: staticInclude,
    });
    const existingPageKeys = new Set(
      existingEntries
        .map((entry) => entry.staticPageContent?.pageKey)
        .filter((pageKey): pageKey is string => Boolean(pageKey)),
    );

    for (const page of managedStaticPages) {
      if (existingPageKeys.has(page.pageKey)) {
        continue;
      }
      await this.prisma.contentEntry.create({
        data: {
          type: ContentType.STATIC_PAGE,
          title: page.title,
          titleEn: page.title,
          titleZh: getDefaultStaticPageTitleZh(page.pageKey),
          slug: page.slug,
          status: ContentStatus.PUBLISHED,
          seoTitle: page.seoTitle,
          seoTitleEn: page.seoTitle,
          seoTitleZh: getDefaultStaticPageSeoTitleZh(page.pageKey),
          seoDescription: page.seoDescription,
          seoDescriptionEn: page.seoDescription,
          seoDescriptionZh: getDefaultStaticPageSeoDescriptionZh(page.pageKey),
          publishedAt: new Date(page.updatedAt),
          staticPageContent: {
            create: {
              pageKey: page.pageKey,
              pathname: page.pathname,
              content: page.content as Prisma.InputJsonValue,
              contentEn: page.content as Prisma.InputJsonValue,
              contentZh: toNullableJsonInput(page.contentZh ?? null),
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

async function assertGuideExists(tx: PrismaNamespace.TransactionClient, id: string) {
  const existing = await tx.contentEntry.findUnique({ where: { id } });
  if (!existing || existing.type !== ContentType.GUIDE) {
    throw new NotFoundException({ code: "GUIDE_NOT_FOUND", message: "Guide not found" });
  }
}

function buildGuideContentData(input: UpsertGuideDto) {
  return {
    dek: input.dek.trim(),
    dekEn: normalizeNullableString(input.dekEn) ?? input.dek.trim(),
    dekZh: normalizeNullableString(input.dekZh),
    category: input.category.trim(),
    categoryEn: normalizeNullableString(input.categoryEn) ?? input.category.trim(),
    categoryZh: normalizeNullableString(input.categoryZh),
    authorName: input.authorName.trim(),
    authorRole: input.authorRole.trim(),
    authorRoleEn: normalizeNullableString(input.authorRoleEn) ?? input.authorRole.trim(),
    authorRoleZh: normalizeNullableString(input.authorRoleZh),
    readTime: input.readTime.trim(),
    readTimeEn: normalizeNullableString(input.readTimeEn) ?? input.readTime.trim(),
    readTimeZh: normalizeNullableString(input.readTimeZh),
    sections: input.sections as unknown as Prisma.InputJsonValue,
    sectionsEn: input.sectionsEn as unknown as Prisma.InputJsonValue,
    sectionsZh: input.sectionsZh as unknown as Prisma.InputJsonValue,
    faq: input.faq as unknown as Prisma.InputJsonValue,
    faqEn: input.faqEn as unknown as Prisma.InputJsonValue,
    faqZh: input.faqZh as unknown as Prisma.InputJsonValue,
    relatedProducts: input.relatedProducts as unknown as Prisma.InputJsonValue,
    relatedCollections: input.relatedCollections as unknown as Prisma.InputJsonValue,
    relatedGuides: input.relatedGuides as unknown as Prisma.InputJsonValue,
  };
}

function normalizeNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toNullableJsonInput(value: Record<string, unknown> | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function getDefaultStaticPageTitleZh(pageKey: StaticPageKey) {
  if (pageKey === "ABOUT") return "关于 PulseGear";
  if (pageKey === "FIT_GUIDE") return "尺码指南";
  return "首页";
}

function getDefaultStaticPageSeoTitleZh(pageKey: StaticPageKey) {
  if (pageKey === "ABOUT") return "关于 PulseGear";
  if (pageKey === "FIT_GUIDE") return "尺码指南";
  return "PulseGear | 轻量支撑与收纳装备";
}

function getDefaultStaticPageSeoDescriptionZh(pageKey: StaticPageKey) {
  if (pageKey === "ABOUT") {
    return "了解 PulseGear 如何为高频训练场景打造轻量支撑、收纳、补水与吸汗装备。";
  }
  if (pageKey === "FIT_GUIDE") {
    return "使用 PulseGear 尺码指南，根据围度和动作选择更合适的支撑、收纳与运动袜尺寸。";
  }
  return "选购适用于跑步、训练和球类运动的轻量支撑、稳固收纳、补水与恢复装备。";
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
    titleEn: entry.titleEn ?? null,
    titleZh: entry.titleZh ?? null,
    slug: entry.slug,
    status: entry.status,
    seoTitle: entry.seoTitle ?? null,
    seoTitleEn: entry.seoTitleEn ?? null,
    seoTitleZh: entry.seoTitleZh ?? null,
    seoDescription: entry.seoDescription ?? null,
    seoDescriptionEn: entry.seoDescriptionEn ?? null,
    seoDescriptionZh: entry.seoDescriptionZh ?? null,
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    updatedAt: entry.updatedAt.toISOString(),
    dek: entry.guideContent.dek,
    dekEn: entry.guideContent.dekEn ?? null,
    dekZh: entry.guideContent.dekZh ?? null,
    category: entry.guideContent.category,
    categoryEn: entry.guideContent.categoryEn ?? null,
    categoryZh: entry.guideContent.categoryZh ?? null,
    authorName: entry.guideContent.authorName,
    authorRole: entry.guideContent.authorRole,
    authorRoleEn: entry.guideContent.authorRoleEn ?? null,
    authorRoleZh: entry.guideContent.authorRoleZh ?? null,
    readTime: entry.guideContent.readTime,
    readTimeEn: entry.guideContent.readTimeEn ?? null,
    readTimeZh: entry.guideContent.readTimeZh ?? null,
    sections: entry.guideContent.sections as GuidePayload["sections"],
    sectionsEn: (entry.guideContent.sectionsEn as GuidePayload["sectionsEn"] | null) ?? [],
    sectionsZh: (entry.guideContent.sectionsZh as GuidePayload["sectionsZh"] | null) ?? [],
    faq: entry.guideContent.faq as GuidePayload["faq"],
    faqEn: (entry.guideContent.faqEn as GuidePayload["faqEn"] | null) ?? [],
    faqZh: (entry.guideContent.faqZh as GuidePayload["faqZh"] | null) ?? [],
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
    titleEn: entry.titleEn ?? null,
    titleZh: entry.titleZh ?? null,
    slug: entry.slug,
    status: entry.status,
    seoTitle: entry.seoTitle ?? null,
    seoTitleEn: entry.seoTitleEn ?? null,
    seoTitleZh: entry.seoTitleZh ?? null,
    seoDescription: entry.seoDescription ?? null,
    seoDescriptionEn: entry.seoDescriptionEn ?? null,
    seoDescriptionZh: entry.seoDescriptionZh ?? null,
    items: entry.faqContent.items as FaqPayload["items"],
    itemsEn: (entry.faqContent.itemsEn as FaqPayload["itemsEn"] | null) ?? [],
    itemsZh: (entry.faqContent.itemsZh as FaqPayload["itemsZh"] | null) ?? [],
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function mapCollectionLandingEntry(
  entry: Prisma.ContentEntryGetPayload<{ include: typeof collectionInclude }>,
): CollectionLandingPayload {
  if (!entry.collectionLandingContent) {
    throw new NotFoundException({ code: "COLLECTION_LANDING_NOT_FOUND", message: "Collection landing not found" });
  }

  return {
    id: entry.id,
    title: entry.title,
    titleEn: entry.titleEn ?? null,
    titleZh: entry.titleZh ?? null,
    slug: entry.slug,
    pathname: entry.collectionLandingContent.pathname,
    scenario: entry.collectionLandingContent.scenario ?? null,
    status: entry.status,
    seoTitle: entry.seoTitle ?? null,
    seoTitleEn: entry.seoTitleEn ?? null,
    seoTitleZh: entry.seoTitleZh ?? null,
    seoDescription: entry.seoDescription ?? null,
    seoDescriptionEn: entry.seoDescriptionEn ?? null,
    seoDescriptionZh: entry.seoDescriptionZh ?? null,
    intro: entry.collectionLandingContent.intro ?? null,
    introEn: entry.collectionLandingContent.introEn ?? null,
    introZh: entry.collectionLandingContent.introZh ?? null,
    category: entry.collectionLandingContent.category ?? null,
    useCase: entry.collectionLandingContent.useCase ?? null,
    relatedGuideSlugs: entry.collectionLandingContent.relatedGuideSlugs as string[],
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function mapStaticPageEntry(
  entry: Prisma.ContentEntryGetPayload<{ include: typeof staticInclude }>,
): StaticPagePayload {
  if (!entry.staticPageContent) {
    throw new NotFoundException({ code: "STATIC_PAGE_NOT_FOUND", message: "Static page not found" });
  }

  return {
    id: entry.id,
    pageKey: entry.staticPageContent.pageKey as StaticPageKey,
    title: entry.title,
    titleEn: entry.titleEn ?? null,
    titleZh: entry.titleZh ?? null,
    slug: entry.slug,
    pathname: entry.staticPageContent.pathname,
    status: entry.status,
    seoTitle: entry.seoTitle ?? null,
    seoTitleEn: entry.seoTitleEn ?? null,
    seoTitleZh: entry.seoTitleZh ?? null,
    seoDescription: entry.seoDescription ?? null,
    seoDescriptionEn: entry.seoDescriptionEn ?? null,
    seoDescriptionZh: entry.seoDescriptionZh ?? null,
    content: withStaticPageDefaults(
      entry.staticPageContent.pageKey as StaticPageKey,
      entry.staticPageContent.content as StaticPagePayload["content"],
      "base",
    ) as StaticPagePayload["content"],
    contentEn: withStaticPageDefaults(
      entry.staticPageContent.pageKey as StaticPageKey,
      (entry.staticPageContent.contentEn as StaticPagePayload["contentEn"] | null) ?? null,
      "en",
    ),
    contentZh: withStaticPageDefaults(
      entry.staticPageContent.pageKey as StaticPageKey,
      (entry.staticPageContent.contentZh as StaticPagePayload["contentZh"] | null) ?? null,
      "zh",
    ),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function mapLocalizedGuideEntry(
  entry: Prisma.ContentEntryGetPayload<{ include: typeof guideInclude }>,
  locale: "en" | "zh",
) {
  const mapped = mapGuideEntry(entry);
  return {
    id: mapped.id,
    title: pickLocalizedString(locale, mapped.titleZh, mapped.titleEn, mapped.title),
    slug: mapped.slug,
    status: mapped.status,
    seoTitle: pickLocalizedNullableString(locale, mapped.seoTitleZh, mapped.seoTitleEn, mapped.seoTitle),
    seoDescription: pickLocalizedNullableString(locale, mapped.seoDescriptionZh, mapped.seoDescriptionEn, mapped.seoDescription),
    publishedAt: mapped.publishedAt,
    updatedAt: mapped.updatedAt,
    dek: pickLocalizedString(locale, mapped.dekZh, mapped.dekEn, mapped.dek),
    category: pickLocalizedString(locale, mapped.categoryZh, mapped.categoryEn, mapped.category),
    authorName: mapped.authorName,
    authorRole: pickLocalizedString(locale, mapped.authorRoleZh, mapped.authorRoleEn, mapped.authorRole),
    readTime: pickLocalizedString(locale, mapped.readTimeZh, mapped.readTimeEn, mapped.readTime),
    sections: pickLocalizedJsonList(locale, mapped.sectionsZh, mapped.sectionsEn, mapped.sections),
    faq: pickLocalizedJsonList(locale, mapped.faqZh, mapped.faqEn, mapped.faq),
    relatedProducts: mapped.relatedProducts,
    relatedCollections: mapped.relatedCollections,
    relatedGuides: mapped.relatedGuides,
  };
}

function mapLocalizedFaqEntry(
  entry: Prisma.ContentEntryGetPayload<{ include: typeof faqInclude }>,
  locale: "en" | "zh",
) {
  const mapped = mapFaqEntry(entry);
  return {
    title: pickLocalizedString(locale, mapped.titleZh, mapped.titleEn, mapped.title),
    seoTitle: pickLocalizedNullableString(locale, mapped.seoTitleZh, mapped.seoTitleEn, mapped.seoTitle),
    seoDescription: pickLocalizedNullableString(locale, mapped.seoDescriptionZh, mapped.seoDescriptionEn, mapped.seoDescription),
    items: pickLocalizedJsonList(locale, mapped.itemsZh, mapped.itemsEn, mapped.items),
  };
}

function mapLocalizedCollectionLandingEntry(
  entry: Prisma.ContentEntryGetPayload<{ include: typeof collectionInclude }>,
  locale: "en" | "zh",
) {
  const mapped = mapCollectionLandingEntry(entry);
  return {
    title: pickLocalizedString(locale, mapped.titleZh, mapped.titleEn, mapped.title),
    description: pickLocalizedNullableString(locale, mapped.seoDescriptionZh, mapped.seoDescriptionEn, mapped.seoDescription) ?? "",
    intro: pickLocalizedNullableString(locale, mapped.introZh, mapped.introEn, mapped.intro) ?? "",
    pathname: mapped.pathname,
    slug: mapped.slug,
    scenario: mapped.scenario,
    category: mapped.category,
    useCase: mapped.useCase,
    relatedGuideSlugs: mapped.relatedGuideSlugs,
    updatedAt: mapped.updatedAt,
  };
}

function mapLocalizedStaticPageEntry(
  entry: Prisma.ContentEntryGetPayload<{ include: typeof staticInclude }>,
  locale: "en" | "zh",
) {
  const mapped = mapStaticPageEntry(entry);
  return {
    pageKey: mapped.pageKey,
    title: pickLocalizedString(locale, mapped.titleZh, mapped.titleEn, mapped.title),
    seoTitle: pickLocalizedNullableString(locale, mapped.seoTitleZh, mapped.seoTitleEn, mapped.seoTitle),
    seoDescription: pickLocalizedNullableString(locale, mapped.seoDescriptionZh, mapped.seoDescriptionEn, mapped.seoDescription),
    pathname: mapped.pathname,
    slug: mapped.slug,
    updatedAt: mapped.updatedAt,
    content: pickLocalizedStaticPageContent(locale, mapped.contentZh, mapped.contentEn, mapped.content),
  };
}

function pickLocalizedString(locale: "en" | "zh", zhValue: string | null, enValue: string | null, fallback: string) {
  if (locale === "zh") {
    return normalizeNullableString(zhValue) ?? normalizeNullableString(enValue) ?? fallback;
  }
  return normalizeNullableString(enValue) ?? fallback;
}

function pickLocalizedNullableString(locale: "en" | "zh", zhValue: string | null, enValue: string | null, fallback: string | null) {
  if (locale === "zh") {
    return normalizeNullableString(zhValue) ?? normalizeNullableString(enValue) ?? normalizeNullableString(fallback);
  }
  return normalizeNullableString(enValue) ?? normalizeNullableString(fallback);
}

function pickLocalizedJsonList<T>(locale: "en" | "zh", zhValue: T[], enValue: T[], fallback: T[]) {
  if (locale === "zh") {
    return zhValue.length ? zhValue : enValue.length ? enValue : fallback;
  }
  return enValue.length ? enValue : fallback;
}

function pickLocalizedStaticPageContent(
  locale: "en" | "zh",
  zhValue: StaticPagePayload["contentZh"],
  enValue: StaticPagePayload["contentEn"],
  fallback: StaticPagePayload["content"],
) {
  if (locale === "zh") {
    return zhValue ?? enValue ?? fallback;
  }
  return enValue ?? fallback;
}

function withStaticPageDefaults(
  pageKey: StaticPageKey,
  value: StaticPagePayload["content"] | StaticPagePayload["contentEn"] | StaticPagePayload["contentZh"] | null,
  locale: "base" | "en" | "zh",
): StaticPagePayload["content"] | StaticPagePayload["contentEn"] | StaticPagePayload["contentZh"] | null {
  if (!value) {
    return locale === "zh"
      ? getManagedStaticPageDefaultContent(pageKey, locale) ?? null
      : getManagedStaticPageDefaultContent(pageKey, locale)!;
  }
  const defaults = getManagedStaticPageDefaultContent(pageKey, locale);
  if (!defaults) return value;
  return {
    ...defaults,
    ...value,
  } as StaticPagePayload["content"];
}

function getManagedStaticPageDefaultContent(pageKey: StaticPageKey, locale: "base" | "en" | "zh") {
  const page = managedStaticPages.find((candidate) => candidate.pageKey === pageKey);
  if (!page) return null;
  if (locale === "zh") {
    return page.contentZh ?? page.content;
  }
  return page.content;
}
