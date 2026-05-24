import { ContentStatus, ContentType } from "@prisma/client";
import type { PrismaService } from "../common/prisma.service";
import { AdminContentService } from "./admin-content.service";

describe("AdminContentService", () => {
  const actor = { adminId: "admin_1", adminEmail: "admin@pulsegear.local" };

  function createPrismaMock() {
    const entry = {
      id: "content_1",
      type: ContentType.GUIDE,
      title: "Guide title",
      slug: "guide-title",
      status: ContentStatus.DRAFT,
      seoTitle: "SEO title",
      seoDescription: "SEO description",
      publishedAt: null,
      updatedAt: new Date("2026-05-21T00:00:00.000Z"),
      guideContent: {
        entryId: "content_1",
        dek: "Dek",
        category: "Run",
        authorName: "Editor",
        authorRole: "Coach",
        readTime: "4 min read",
        sections: [{ heading: "Start", body: "Body" }],
        faq: [{ question: "Q", answer: "A" }],
        relatedProducts: ["pulseflex-knee-sleeve"],
        relatedCollections: [{ title: "Support", path: "/collections/support" }],
        relatedGuides: ["other-guide"],
      },
    };

    const tx = {
      contentEntry: {
        create: jest.fn().mockResolvedValue(entry),
        update: jest.fn().mockResolvedValue({ ...entry, status: ContentStatus.PUBLISHED, publishedAt: new Date("2026-05-21T00:00:00.000Z") }),
        findUnique: jest.fn().mockResolvedValue(entry),
        findFirst: jest.fn().mockResolvedValue(entry),
        findMany: jest.fn().mockResolvedValue([{ ...entry, status: ContentStatus.PUBLISHED }]),
        count: jest.fn().mockResolvedValue(0),
        upsert: jest.fn().mockResolvedValue({
          id: "faq_1",
          type: ContentType.FAQ,
          title: "FAQ",
          slug: "faq",
          status: ContentStatus.PUBLISHED,
          seoTitle: "FAQ | PulseGear",
          seoDescription: "FAQ description",
          publishedAt: new Date("2026-05-21T00:00:00.000Z"),
          updatedAt: new Date("2026-05-21T00:00:00.000Z"),
          faqContent: {
            entryId: "faq_1",
            items: [{ question: "Where do you ship?", answer: "US and UK." }],
          },
        }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };

    const prisma = {
      ...tx,
      $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    } as unknown as PrismaService;

    return { prisma, tx, entry };
  }

  it("creates a draft guide and writes an audit log", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminContentService(prisma);

    const result = await service.createGuide(actor, {
      title: "Guide title",
      slug: "guide-title",
      seoTitle: "SEO title",
      seoDescription: "SEO description",
      dek: "Dek",
      category: "Run",
      authorName: "Editor",
      authorRole: "Coach",
      readTime: "4 min read",
      sections: [{ heading: "Start", body: "Body" }],
      faq: [{ question: "Q", answer: "A" }],
      relatedProducts: ["pulseflex-knee-sleeve"],
      relatedCollections: [{ title: "Support", path: "/collections/support" }],
      relatedGuides: ["other-guide"],
      status: ContentStatus.DRAFT,
    });

    expect(tx.contentEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: ContentType.GUIDE,
        status: ContentStatus.DRAFT,
        title: "Guide title",
        slug: "guide-title",
      }),
      include: expect.any(Object),
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "CONTENT_CREATED",
        resource: "content_entry",
      }),
    });
    expect(result.status).toBe(ContentStatus.DRAFT);
  });

  it("publishes, archives, and drafts a guide with audit logs", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminContentService(prisma);

    await service.publishGuide("content_1", actor);
    await service.archiveGuide("content_1", actor);
    await service.moveGuideToDraft("content_1", actor);

    expect(tx.contentEntry.update).toHaveBeenCalledTimes(3);
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "CONTENT_PUBLISHED",
        resourceId: "content_1",
      }),
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "CONTENT_ARCHIVED",
        resourceId: "content_1",
      }),
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "CONTENT_DRAFTED",
        resourceId: "content_1",
      }),
    });
  });

  it("updates FAQ content and writes an audit log", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminContentService(prisma);

    await service.updateFaq(actor, {
      title: "FAQ",
      slug: "faq",
      seoTitle: "FAQ | PulseGear",
      seoDescription: "FAQ description",
      items: [{ question: "Where do you ship?", answer: "US and UK." }],
      status: ContentStatus.PUBLISHED,
    });

    expect(tx.contentEntry.upsert).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "FAQ_UPDATED",
        resource: "content_entry",
      }),
    });
  });

  it("returns only published guides for storefront reads", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminContentService(prisma);

    await service.listPublishedGuides();
    await service.getPublishedGuideBySlug("guide-title");

    expect(tx.contentEntry.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        type: ContentType.GUIDE,
        status: ContentStatus.PUBLISHED,
      }),
    }));
    expect(tx.contentEntry.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        type: ContentType.GUIDE,
        status: ContentStatus.PUBLISHED,
        slug: "guide-title",
      }),
    }));
  });
});
