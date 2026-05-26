import { AdminRoleName, ContentStatus, ContentType, PrismaClient, ProductStatus } from "@prisma/client";
import { hashAdminPassword } from "../src/admin-auth/admin-auth.service";
import { guides } from "../../data/guides";
import { faqs } from "../../data/faq";

const prisma = new PrismaClient();

type SeedProduct = {
  title: string;
  slug: string;
  category: string;
  priceCents: number;
  compareAtPriceCents: number;
  rating: string;
  reviewCount: number;
  shortDescription: string;
  description: string;
  benefits: string[];
  features: string[];
  useCases: string[];
  colors: string[];
  sizes: string[];
  images: string[];
  badge: string;
  bundleEligible: boolean;
  stockBase: number;
};

const products: SeedProduct[] = [
  {
    title: "PulseFlex Knee Sleeve",
    slug: "pulseflex-knee-sleeve",
    category: "Support",
    priceCents: 3400,
    compareAtPriceCents: 4400,
    rating: "4.8",
    reviewCount: 182,
    shortDescription: "Breathable compression support for miles, lifts, and court cuts.",
    description: "A low-profile compression sleeve built for running, gym training, and court movement.",
    benefits: ["No-slip silicone grip", "Breathable compression", "Left/right neutral fit", "Machine washable"],
    features: ["Zoned knit compression", "Anti-roll top cuff", "Open-motion flex panel", "Low-profile under tights"],
    useCases: ["Run", "Train", "Court", "Recovery"],
    colors: ["Graphite", "Steel", "Lime"],
    sizes: ["S", "M", "L", "XL"],
    images: ["knee-sleeve-hero", "knee-sleeve-scale", "knee-sleeve-detail"],
    badge: "Best seller",
    bundleEligible: true,
    stockBase: 18,
  },
  {
    title: "PulseBand Patella Strap",
    slug: "pulseband-patella-strap",
    category: "Support",
    priceCents: 2200,
    compareAtPriceCents: 2800,
    rating: "4.7",
    reviewCount: 96,
    shortDescription: "Targeted below-knee support with a quick-adjust strap for training days.",
    description: "Targeted support strap with a contoured pressure pad and low-bulk fit.",
    benefits: ["Targeted patella support", "Quick hook adjustment", "Sweat-ready lining", "Minimal bulk"],
    features: ["Contoured pressure pad", "Reflective pull tab", "Soft inner face", "Single-hand fit adjustment"],
    useCases: ["Run", "Train", "Court"],
    colors: ["Graphite", "Signal Blue"],
    sizes: ["S/M", "L/XL", "One size"],
    images: ["patella-hero", "patella-scale", "patella-detail"],
    badge: "Targeted support",
    bundleEligible: true,
    stockBase: 14,
  },
  {
    title: "AeroRun Hydration Belt",
    slug: "aerorun-hydration-belt",
    category: "Hydration",
    priceCents: 4800,
    compareAtPriceCents: 5800,
    rating: "4.6",
    reviewCount: 74,
    shortDescription: "No-bounce hydration carry with soft flask storage for warm-weather runs.",
    description: "A stabilized hydration belt for warm-weather runs and long training sessions.",
    benefits: ["No-bounce carry", "Bottle-ready pocket", "Phone sleeve", "Reflective accents"],
    features: ["Stabilized rear cradle", "Stretch mesh pocketing", "Moisture-resistant zip", "Adjustable waist fit"],
    useCases: ["Run", "Train"],
    colors: ["Graphite", "Steel"],
    sizes: ["S/M", "M/L", "L/XL"],
    images: ["hydration-hero", "hydration-scale", "hydration-detail"],
    badge: "Summer run",
    bundleEligible: true,
    stockBase: 8,
  },
  {
    title: "CoreCarry Running Belt",
    slug: "corecarry-running-belt",
    category: "Carry",
    priceCents: 3200,
    compareAtPriceCents: 4000,
    rating: "4.8",
    reviewCount: 143,
    shortDescription: "Slim everyday run belt for phone, keys, gels, and small essentials.",
    description: "A stretch run belt that keeps essentials close without bounce.",
    benefits: ["No-bounce profile", "Phone-safe pocket", "Key clip", "Lightweight stretch"],
    features: ["Four-way stretch body", "Hidden zip compartment", "Low-friction edges", "Reflective logo hit"],
    useCases: ["Run", "Train"],
    colors: ["Graphite", "Lime", "Signal Blue"],
    sizes: ["XS/S", "M/L", "XL"],
    images: ["belt-hero", "belt-scale", "belt-detail"],
    badge: "No-bounce",
    bundleEligible: true,
    stockBase: 16,
  },
  {
    title: "GripFlow Training Socks",
    slug: "gripflow-training-socks",
    category: "Socks",
    priceCents: 1800,
    compareAtPriceCents: 2400,
    rating: "4.7",
    reviewCount: 121,
    shortDescription: "Breathable crew socks with arch support and court-ready grip zones.",
    description: "Structured training socks with mapped cushioning and grip zones.",
    benefits: ["Arch support", "Breathable mesh", "Grip zones", "Blister-aware toe seam"],
    features: ["Mapped cushioning", "Ventilated upper", "Ribbed midfoot", "Reinforced heel"],
    useCases: ["Run", "Train", "Court"],
    colors: ["White", "Graphite", "Lime"],
    sizes: ["S", "M", "L", "XL"],
    images: ["socks-hero", "socks-scale", "socks-detail"],
    badge: "Add-on pick",
    bundleEligible: true,
    stockBase: 28,
  },
  {
    title: "CourtDry Sweatband Set",
    slug: "courtdry-sweatband-set",
    category: "Sweat",
    priceCents: 2000,
    compareAtPriceCents: 2600,
    rating: "4.5",
    reviewCount: 58,
    shortDescription: "Headband and wristband set built for hot courts and gym sessions.",
    description: "A sweat-control set for court and gym sessions in warm conditions.",
    benefits: ["Sweat-ready terry", "Secure stretch", "Fast drying", "Court kit essential"],
    features: ["Headband plus wrist pair", "Soft inner loop", "Shape-retaining knit", "Packable design"],
    useCases: ["Train", "Court"],
    colors: ["Graphite", "White", "Signal Blue"],
    sizes: ["One size", "Standard", "Wide"],
    images: ["sweatband-hero", "sweatband-scale", "sweatband-detail"],
    badge: "Court ready",
    bundleEligible: true,
    stockBase: 20,
  },
  {
    title: "ChillFlow Sport Bottle",
    slug: "chillflow-sport-bottle",
    category: "Hydration",
    priceCents: 2600,
    compareAtPriceCents: 3400,
    rating: "4.6",
    reviewCount: 89,
    shortDescription: "Light insulated bottle with a grip waist and leak-resistant sport cap.",
    description: "A light insulated bottle with a one-hand sport cap and easy-clean opening.",
    benefits: ["Leak-resistant cap", "Easy-grip waist", "Light insulation", "Cup-holder friendly"],
    features: ["22 oz capacity", "One-hand sport valve", "BPA-free body", "Wide-mouth cleaning"],
    useCases: ["Run", "Train", "Court", "Recovery"],
    colors: ["Graphite", "Lime", "Signal Blue"],
    sizes: ["18 oz", "22 oz", "26 oz"],
    images: ["bottle-hero", "bottle-scale", "bottle-detail"],
    badge: "Hydration",
    bundleEligible: true,
    stockBase: 24,
  },
  {
    title: "Recovery Compression Sleeve",
    slug: "recovery-compression-sleeve",
    category: "Recovery",
    priceCents: 3000,
    compareAtPriceCents: 3800,
    rating: "4.7",
    reviewCount: 67,
    shortDescription: "Light calf and knee-area compression for cooldowns and travel days.",
    description: "Soft compression for cooldown routines, travel days, and light recovery sessions.",
    benefits: ["Graduated feel", "Soft compression", "Travel friendly", "Breathable knit"],
    features: ["Mapped compression zones", "Seam-reduced finish", "Pack-flat profile", "All-day comfort cuff"],
    useCases: ["Recovery", "Run", "Train"],
    colors: ["Graphite", "Steel"],
    sizes: ["S", "M", "L", "XL"],
    images: ["recovery-hero", "recovery-scale", "recovery-detail"],
    badge: "Recovery",
    bundleEligible: false,
    stockBase: 12,
  },
];

const collections = [
  { title: "Support", slug: "support", description: "Knee sleeves, patella straps, and recovery support." },
  { title: "Carry", slug: "carry", description: "No-bounce belts and lightweight storage." },
  { title: "Hydration", slug: "hydration", description: "Bottles and hydration-ready running gear." },
  { title: "Socks", slug: "socks", description: "Training socks for running, gym, and court sessions." },
  { title: "Sweat", slug: "sweat", description: "Sweat-ready headbands and wristbands." },
  { title: "Recovery", slug: "recovery", description: "Compression essentials for recovery routines." },
];

const adminRoles = [
  { name: AdminRoleName.SUPER_ADMIN, label: "Super Admin" },
  { name: AdminRoleName.ADMIN, label: "Admin" },
  { name: AdminRoleName.OPERATOR, label: "Operator" },
  { name: AdminRoleName.CONTENT_EDITOR, label: "Content Editor" },
  { name: AdminRoleName.ANALYST, label: "Analyst" },
  { name: AdminRoleName.VIEWER, label: "Viewer" },
];

function skuFor(slug: string, color: string, size: string) {
  const productCode = slug.split("-").map((part) => part[0]).join("").toUpperCase();
  const colorCode = color.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
  const sizeCode = size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `PG-${productCode}-${colorCode}-${sizeCode}`;
}

async function main() {
  await prisma.paymentEvent.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.orderStatusEvent.deleteMany();
  await prisma.orderNote.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productCollection.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  for (const role of adminRoles) {
    await prisma.adminRole.upsert({
      where: { name: role.name },
      update: { label: role.label },
      create: role,
    });
  }

  const collectionBySlug = new Map<string, string>();
  for (const [index, collection] of collections.entries()) {
    const created = await prisma.collection.create({ data: { ...collection, sortOrder: index } });
    collectionBySlug.set(collection.slug, created.id);
  }

  for (const [productIndex, product] of products.entries()) {
    const created = await prisma.product.create({
      data: {
        title: product.title,
        titleEn: product.title,
        slug: product.slug,
        category: product.category,
        shortDescription: product.shortDescription,
        shortDescriptionEn: product.shortDescription,
        description: product.description,
        descriptionEn: product.description,
        status: ProductStatus.ACTIVE,
        badge: product.badge,
        rating: product.rating,
        reviewCount: product.reviewCount,
        benefits: product.benefits,
        benefitsEn: product.benefits,
        features: product.features,
        featuresEn: product.features,
        useCases: product.useCases,
        bundleEligible: product.bundleEligible,
        images: {
          create: product.images.map((image, index) => ({ url: image, alt: `${product.title} ${index + 1}`, sortOrder: index })),
        },
        variants: {
          create: product.colors.flatMap((color, colorIndex) =>
            product.sizes.map((size, sizeIndex) => ({
              sku: skuFor(product.slug, color, size),
              color,
              size,
              priceCents: product.priceCents,
              compareAtPriceCents: product.compareAtPriceCents,
              stock: product.stockBase + colorIndex * 2 + sizeIndex,
              lowStockThreshold: 5,
              weightGrams: product.category === "Hydration" ? 380 : product.category === "Carry" ? 160 : 220,
              active: true,
            })),
          ),
        },
      },
    });

    const collectionId = collectionBySlug.get(product.category.toLowerCase());
    if (collectionId) {
      await prisma.productCollection.create({ data: { productId: created.id, collectionId, sortOrder: productIndex } });
    }
  }

  const superAdminRole = await prisma.adminRole.findUniqueOrThrow({ where: { name: AdminRoleName.SUPER_ADMIN } });
  await prisma.adminUser.upsert({
    where: { email: "admin@pulsegear.local" },
    update: {
      name: "PulseGear Super Admin",
      roleId: superAdminRole.id,
      active: true,
    },
    create: {
      email: "admin@pulsegear.local",
      name: "PulseGear Super Admin",
      passwordHash: hashAdminPassword("Admin1234!"),
      roleId: superAdminRole.id,
      active: true,
    },
  });

  const guideCount = await prisma.contentEntry.count({ where: { type: ContentType.GUIDE } });
  if (guideCount === 0) {
    for (const guide of guides) {
      await prisma.contentEntry.create({
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
              sections: guide.sections,
              faq: guide.faq,
              relatedProducts: guide.relatedProducts,
              relatedCollections: guide.relatedCollections,
              relatedGuides: guide.relatedGuides,
            },
          },
        },
      });
    }
  }

  await prisma.contentEntry.upsert({
    where: { type_slug: { type: ContentType.FAQ, slug: "faq" } },
    update: {
      title: "FAQ",
      status: ContentStatus.PUBLISHED,
      seoTitle: "FAQ | PulseGear",
      seoDescription: "Frequently asked questions about PulseGear orders, shipping, and fit.",
      publishedAt: new Date(),
      faqContent: {
        upsert: {
          update: { items: faqs },
          create: { items: faqs },
        },
      },
    },
    create: {
      type: ContentType.FAQ,
      title: "FAQ",
      slug: "faq",
      status: ContentStatus.PUBLISHED,
      seoTitle: "FAQ | PulseGear",
      seoDescription: "Frequently asked questions about PulseGear orders, shipping, and fit.",
      publishedAt: new Date(),
      faqContent: { create: { items: faqs } },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
