import { scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlRoot = path.resolve(__dirname, "..");

const ADMIN_PASSWORD = "Admin1234!";
const ADMIN_PASSWORD_SALT = "pulsegear_seed_salt01";

const products = [
  { title: "PulseFlex Knee Sleeve", slug: "pulseflex-knee-sleeve", category: "Support", priceCents: 3400, compareAtPriceCents: 4400, rating: "4.8", reviewCount: 182, shortDescription: "Breathable compression support for miles, lifts, and court cuts.", description: "A low-profile compression sleeve built for running, gym training, and court movement.", benefits: ["No-slip silicone grip", "Breathable compression", "Left/right neutral fit", "Machine washable"], features: ["Zoned knit compression", "Anti-roll top cuff", "Open-motion flex panel", "Low-profile under tights"], useCases: ["Run", "Train", "Court", "Recovery"], colors: ["Graphite", "Steel", "Lime"], sizes: ["S", "M", "L", "XL"], images: ["knee-sleeve-hero", "knee-sleeve-scale", "knee-sleeve-detail"], badge: "Best seller", bundleEligible: true, stockBase: 18 },
  { title: "PulseBand Patella Strap", slug: "pulseband-patella-strap", category: "Support", priceCents: 2200, compareAtPriceCents: 2800, rating: "4.7", reviewCount: 96, shortDescription: "Targeted below-knee support with a quick-adjust strap for training days.", description: "Targeted support strap with a contoured pressure pad and low-bulk fit.", benefits: ["Targeted patella support", "Quick hook adjustment", "Sweat-ready lining", "Minimal bulk"], features: ["Contoured pressure pad", "Reflective pull tab", "Soft inner face", "Single-hand fit adjustment"], useCases: ["Run", "Train", "Court"], colors: ["Graphite", "Signal Blue"], sizes: ["S/M", "L/XL", "One size"], images: ["patella-hero", "patella-scale", "patella-detail"], badge: "Targeted support", bundleEligible: true, stockBase: 14 },
  { title: "AeroRun Hydration Belt", slug: "aerorun-hydration-belt", category: "Hydration", priceCents: 4800, compareAtPriceCents: 5800, rating: "4.6", reviewCount: 74, shortDescription: "No-bounce hydration carry with soft flask storage for warm-weather runs.", description: "A stabilized hydration belt for warm-weather runs and long training sessions.", benefits: ["No-bounce carry", "Bottle-ready pocket", "Phone sleeve", "Reflective accents"], features: ["Stabilized rear cradle", "Stretch mesh pocketing", "Moisture-resistant zip", "Adjustable waist fit"], useCases: ["Run", "Train"], colors: ["Graphite", "Steel"], sizes: ["S/M", "M/L", "L/XL"], images: ["hydration-hero", "hydration-scale", "hydration-detail"], badge: "Summer run", bundleEligible: true, stockBase: 8 },
  { title: "CoreCarry Running Belt", slug: "corecarry-running-belt", category: "Carry", priceCents: 3200, compareAtPriceCents: 4000, rating: "4.8", reviewCount: 143, shortDescription: "Slim everyday run belt for phone, keys, gels, and small essentials.", description: "A stretch run belt that keeps essentials close without bounce.", benefits: ["No-bounce profile", "Phone-safe pocket", "Key clip", "Lightweight stretch"], features: ["Four-way stretch body", "Hidden zip compartment", "Low-friction edges", "Reflective logo hit"], useCases: ["Run", "Train"], colors: ["Graphite", "Lime", "Signal Blue"], sizes: ["XS/S", "M/L", "XL"], images: ["belt-hero", "belt-scale", "belt-detail"], badge: "No-bounce", bundleEligible: true, stockBase: 16 },
  { title: "GripFlow Training Socks", slug: "gripflow-training-socks", category: "Socks", priceCents: 1800, compareAtPriceCents: 2400, rating: "4.7", reviewCount: 121, shortDescription: "Breathable crew socks with arch support and court-ready grip zones.", description: "Structured training socks with mapped cushioning and grip zones.", benefits: ["Arch support", "Breathable mesh", "Grip zones", "Blister-aware toe seam"], features: ["Mapped cushioning", "Ventilated upper", "Ribbed midfoot", "Reinforced heel"], useCases: ["Run", "Train", "Court"], colors: ["White", "Graphite", "Lime"], sizes: ["S", "M", "L", "XL"], images: ["socks-hero", "socks-scale", "socks-detail"], badge: "Add-on pick", bundleEligible: true, stockBase: 28 },
  { title: "CourtDry Sweatband Set", slug: "courtdry-sweatband-set", category: "Sweat", priceCents: 2000, compareAtPriceCents: 2600, rating: "4.5", reviewCount: 58, shortDescription: "Headband and wristband set built for hot courts and gym sessions.", description: "A sweat-control set for court and gym sessions in warm conditions.", benefits: ["Sweat-ready terry", "Secure stretch", "Fast drying", "Court kit essential"], features: ["Headband plus wrist pair", "Soft inner loop", "Shape-retaining knit", "Packable design"], useCases: ["Train", "Court"], colors: ["Graphite", "White", "Signal Blue"], sizes: ["One size", "Standard", "Wide"], images: ["sweatband-hero", "sweatband-scale", "sweatband-detail"], badge: "Court ready", bundleEligible: true, stockBase: 20 },
  { title: "ChillFlow Sport Bottle", slug: "chillflow-sport-bottle", category: "Hydration", priceCents: 2600, compareAtPriceCents: 3400, rating: "4.6", reviewCount: 89, shortDescription: "Light insulated bottle with a grip waist and leak-resistant sport cap.", description: "A light insulated bottle with a one-hand sport cap and easy-clean opening.", benefits: ["Leak-resistant cap", "Easy-grip waist", "Light insulation", "Cup-holder friendly"], features: ["22 oz capacity", "One-hand sport valve", "BPA-free body", "Wide-mouth cleaning"], useCases: ["Run", "Train", "Court", "Recovery"], colors: ["Graphite", "Lime", "Signal Blue"], sizes: ["18 oz", "22 oz", "26 oz"], images: ["bottle-hero", "bottle-scale", "bottle-detail"], badge: "Hydration", bundleEligible: true, stockBase: 24 },
  { title: "Recovery Compression Sleeve", slug: "recovery-compression-sleeve", category: "Recovery", priceCents: 3000, compareAtPriceCents: 3800, rating: "4.7", reviewCount: 67, shortDescription: "Light calf and knee-area compression for cooldowns and travel days.", description: "Soft compression for cooldown routines, travel days, and light recovery sessions.", benefits: ["Graduated feel", "Soft compression", "Travel friendly", "Breathable knit"], features: ["Mapped compression zones", "Seam-reduced finish", "Pack-flat profile", "All-day comfort cuff"], useCases: ["Recovery", "Run", "Train"], colors: ["Graphite", "Steel"], sizes: ["S", "M", "L", "XL"], images: ["recovery-hero", "recovery-scale", "recovery-detail"], badge: "Recovery", bundleEligible: false, stockBase: 12 },
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
  ["SUPER_ADMIN", "Super Admin"],
  ["ADMIN", "Admin"],
  ["OPERATOR", "Operator"],
  ["CONTENT_EDITOR", "Content Editor"],
  ["ANALYST", "Analyst"],
  ["VIEWER", "Viewer"],
];

function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(values) {
  return `ARRAY[${values.map((value) => sqlLiteral(value)).join(", ")}]::text[]`;
}

function skuFor(slug, color, size) {
  const productCode = slug.split("-").map((part) => part[0]).join("").toUpperCase();
  const colorCode = color.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
  const sizeCode = size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `PG-${productCode}-${colorCode}-${sizeCode}`;
}

function id(prefix, key) {
  return `seed_${prefix}_${key.replace(/[^a-zA-Z0-9]+/g, "_")}`;
}

function weightFor(category) {
  if (category === "Hydration") return 380;
  if (category === "Carry") return 160;
  return 220;
}

function main() {
  const passwordHash = `${ADMIN_PASSWORD_SALT}:${scryptSync(ADMIN_PASSWORD, ADMIN_PASSWORD_SALT, 64).toString("hex")}`;
  const lines = [
    "-- PulseGear test / seed data (core catalog + admin)",
    "-- Generated by prisma/sql/scripts/generate-seed-sql.mjs",
    "-- Admin login: admin@pulsegear.local / Admin1234!",
    "",
    "BEGIN;",
    "",
    "-- Optional: clear transactional tables before re-seeding catalog",
    "DELETE FROM \"PaymentEvent\";",
    "DELETE FROM \"InventoryMovement\";",
    "DELETE FROM \"OrderStatusEvent\";",
    "DELETE FROM \"OrderNote\";",
    "DELETE FROM \"OrderItem\";",
    "DELETE FROM \"Order\";",
    "DELETE FROM \"ProductCollection\";",
    "DELETE FROM \"ProductImage\";",
    "DELETE FROM \"ProductVariant\";",
    "DELETE FROM \"Product\";",
    "DELETE FROM \"Collection\";",
    "",
    "-- Admin roles",
    ...adminRoles.map(([name, label]) =>
      `INSERT INTO \"AdminRole\" (\"id\", \"name\", \"label\", \"createdAt\", \"updatedAt\") VALUES (${sqlLiteral(id("role", name))}, ${sqlLiteral(name)}::\"AdminRoleName\", ${sqlLiteral(label)}, NOW(), NOW()) ON CONFLICT (\"name\") DO UPDATE SET \"label\" = EXCLUDED.\"label\", \"updatedAt\" = NOW();`,
    ),
    "",
    "-- Default admin settings",
    `INSERT INTO \"AdminSettings\" (\"id\", \"storefrontUrl\", \"supportEmail\", \"checkoutCurrency\", \"timezone\", \"shippingCountries\", \"defaultFulfillmentSlaDays\", \"returnsPolicyUrl\", \"orderAutoFulfill\", \"primaryPaymentProvider\", \"stripeAutomaticPaymentMethods\", \"paymentFailureMessage\", \"adminSessionTtlHours\", \"auditLoggingEnabled\", \"createdAt\", \"updatedAt\") VALUES ('default', 'http://localhost:3000', 'support@pulsegear.local', 'usd', 'America/Los_Angeles', ARRAY['US','GB']::text[], 3, '/faq', FALSE, 'Stripe Checkout', TRUE, 'Retry checkout from cart if payment is not confirmed.', 12, TRUE, NOW(), NOW()) ON CONFLICT (\"id\") DO NOTHING;`,
    "",
    "-- Collections",
    ...collections.map((collection, index) =>
      `INSERT INTO \"Collection\" (\"id\", \"title\", \"slug\", \"description\", \"sortOrder\") VALUES (${sqlLiteral(id("collection", collection.slug))}, ${sqlLiteral(collection.title)}, ${sqlLiteral(collection.slug)}, ${sqlLiteral(collection.description)}, ${index}) ON CONFLICT (\"slug\") DO NOTHING;`,
    ),
    "",
    "-- Super admin user",
    `INSERT INTO \"AdminUser\" (\"id\", \"email\", \"passwordHash\", \"name\", \"active\", \"roleId\", \"createdAt\", \"updatedAt\") VALUES (${sqlLiteral(id("admin", "super"))}, 'admin@pulsegear.local', ${sqlLiteral(passwordHash)}, 'PulseGear Super Admin', TRUE, ${sqlLiteral(id("role", "SUPER_ADMIN"))}, NOW(), NOW()) ON CONFLICT (\"email\") DO UPDATE SET \"passwordHash\" = EXCLUDED.\"passwordHash\", \"name\" = EXCLUDED.\"name\", \"roleId\" = EXCLUDED.\"roleId\", \"active\" = TRUE, \"updatedAt\" = NOW();`,
    "",
  ];

  for (const [productIndex, product] of products.entries()) {
    const productId = id("product", product.slug);
    const collectionId = id("collection", product.category.toLowerCase());
    lines.push(`-- Product: ${product.title}`);
    lines.push(
      `INSERT INTO \"Product\" (\"id\", \"title\", \"titleEn\", \"slug\", \"category\", \"shortDescription\", \"shortDescriptionEn\", \"description\", \"descriptionEn\", \"status\", \"badge\", \"rating\", \"reviewCount\", \"benefits\", \"benefitsEn\", \"features\", \"featuresEn\", \"useCases\", \"bundleEligible\", \"createdAt\", \"updatedAt\") VALUES (${sqlLiteral(productId)}, ${sqlLiteral(product.title)}, ${sqlLiteral(product.title)}, ${sqlLiteral(product.slug)}, ${sqlLiteral(product.category)}, ${sqlLiteral(product.shortDescription)}, ${sqlLiteral(product.shortDescription)}, ${sqlLiteral(product.description)}, ${sqlLiteral(product.description)}, 'ACTIVE'::\"ProductStatus\", ${sqlLiteral(product.badge)}, ${product.rating}, ${product.reviewCount}, ${sqlArray(product.benefits)}, ${sqlArray(product.benefits)}, ${sqlArray(product.features)}, ${sqlArray(product.features)}, ${sqlArray(product.useCases)}, ${product.bundleEligible}, NOW(), NOW()) ON CONFLICT (\"slug\") DO NOTHING;`,
    );
    product.images.forEach((image, imageIndex) => {
      lines.push(
        `INSERT INTO \"ProductImage\" (\"id\", \"productId\", \"url\", \"alt\", \"sortOrder\") VALUES (${sqlLiteral(id("image", `${product.slug}_${imageIndex}`))}, ${sqlLiteral(productId)}, ${sqlLiteral(image)}, ${sqlLiteral(`${product.title} ${imageIndex + 1}`)}, ${imageIndex}) ON CONFLICT DO NOTHING;`,
      );
    });
    product.colors.forEach((color, colorIndex) => {
      product.sizes.forEach((size, sizeIndex) => {
        const variantId = id("variant", `${product.slug}_${color}_${size}`);
        const sku = skuFor(product.slug, color, size);
        const stock = product.stockBase + colorIndex * 2 + sizeIndex;
        lines.push(
          `INSERT INTO \"ProductVariant\" (\"id\", \"productId\", \"sku\", \"color\", \"size\", \"priceCents\", \"compareAtPriceCents\", \"stock\", \"reservedStock\", \"lowStockThreshold\", \"weightGrams\", \"active\", \"createdAt\", \"updatedAt\") VALUES (${sqlLiteral(variantId)}, ${sqlLiteral(productId)}, ${sqlLiteral(sku)}, ${sqlLiteral(color)}, ${sqlLiteral(size)}, ${product.priceCents}, ${product.compareAtPriceCents}, ${stock}, 0, 5, ${weightFor(product.category)}, TRUE, NOW(), NOW()) ON CONFLICT (\"sku\") DO NOTHING;`,
        );
      });
    });
    lines.push(
      `INSERT INTO \"ProductCollection\" (\"productId\", \"collectionId\", \"sortOrder\") VALUES (${sqlLiteral(productId)}, ${sqlLiteral(collectionId)}, ${productIndex}) ON CONFLICT (\"productId\", \"collectionId\") DO NOTHING;`,
    );
    lines.push("");
  }

  lines.push("COMMIT;");
  lines.push("");
  lines.push("-- Guides / FAQ content: run `npm run prisma:seed` in /api for full CMS content.");

  const outPath = path.join(sqlRoot, "03_test_data.sql");
  fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${outPath}`);
}

main();
