import type { Guide } from "../lib/types";

export type CollectionQueryParams = {
  sort?: string;
  price?: string;
  size?: string;
  color?: string;
};

export type BaseCollectionPage = {
  slug: string;
  category: string;
  title: string;
  description: string;
  intro: string;
  updatedAt: string;
  relatedGuideSlugs: string[];
};

export type CollectionLandingPage = {
  scenario: string;
  slug: string;
  pathname: string;
  title: string;
  description: string;
  intro: string;
  updatedAt: string;
  category?: string;
  useCase?: string;
  relatedGuideSlugs: string[];
};

export const baseCollectionPages: Record<string, BaseCollectionPage> = {
  support: {
    slug: "support",
    category: "Support",
    title: "Support Gear | PulseGear",
    description: "Shop support gear from PulseGear for running, training, court sports, and recovery.",
    updatedAt: "2026-05-20",
    intro:
      "PulseGear support gear is built for athletes who want a more secure feel without adding bulk. This collection focuses on breathable compression, targeted stability, and low-profile construction that layers cleanly under shorts, tights, and training kits. Runners can compare sleeves and straps by how much structure they want over longer miles, while gym and court athletes can look for secure hold during cuts, landings, and repeat sessions. Every product in the support range is selected around fit, motion, and heat management first, so the assortment stays practical instead of broad for its own sake. If you are deciding between full-coverage compression and more focused support, start here, then use the fit guide and buying guides to narrow the right option for your routine. The goal of the category is not to overwhelm with every possible brace type. It is to keep the comparison tight around gear that feels useful for repeat training, travel, and recovery blocks.",
    relatedGuideSlugs: ["choose-knee-support-running", "court-sport-essentials-beginners"],
  },
  carry: {
    slug: "carry",
    category: "Carry",
    title: "Carry Gear | PulseGear",
    description: "Shop no-bounce carry gear from PulseGear for running, training, and everyday workout essentials.",
    updatedAt: "2026-05-20",
    intro:
      "The carry collection is designed for movement-first storage that stays close to the body and out of the way. PulseGear focuses on belts and compact utility pieces that reduce bounce, protect small essentials, and keep access simple during training. For runners, that usually means stable phone storage, fast access to keys or gels, and a fit that does not shift as pace changes. For gym sessions, it means compact carry that does not add unnecessary bulk between warm-up, strength work, and cooldown. This range is intentionally narrow so the tradeoffs are clear: light structure, clean pocket layouts, and performance-first comfort. If you want everyday utility that still feels athletic, these carry styles are the starting point. They also make a practical bridge into hydration and sweat-control accessories when you are building a more complete run or training kit.",
    relatedGuideSlugs: ["summer-run-carry"],
  },
  hydration: {
    slug: "hydration",
    category: "Hydration",
    title: "Hydration Gear | PulseGear",
    description: "Shop hydration gear from PulseGear for running, training, court sports, and recovery routines.",
    updatedAt: "2026-05-20",
    intro:
      "PulseGear hydration gear is built around lightweight carry, easy access, and clean handling on the move. This collection covers bottles and run-ready storage options for athletes who need hydration support without interrupting pace or session flow. The emphasis is on grip, stability, and practical capacity, whether you are planning for hot-weather miles, interval work, or longer court and gym sessions. Products in this category are chosen for how they perform under repeat use: minimal bounce, easy cleaning, dependable closures, and shapes that work with a compact training kit. If you are comparing bottle formats against belt-based hydration storage, start with the use case and session length, then use the related guides below to narrow what belongs in your setup. The collection is meant to answer a practical shopping question: what helps you carry and drink with less friction once the session gets hotter or longer.",
    relatedGuideSlugs: ["summer-run-carry"],
  },
  socks: {
    slug: "socks",
    category: "Socks",
    title: "Training Socks | PulseGear",
    description: "Shop training socks from PulseGear for running, training, and court sessions.",
    updatedAt: "2026-05-20",
    intro:
      "The PulseGear sock collection is focused on structure, breathability, and repeat-session comfort rather than commodity basics. These styles are built for athletes who care about arch hold, friction control, and a cleaner interface between foot, shoe, and training surface. For runners, that means ventilation and stable fit through longer miles. For court and gym sessions, it means grip zones, cushioning placement, and reinforced areas that hold up under lateral movement and frequent use. The assortment stays intentionally tight so sizing and performance tradeoffs are easy to compare. If your priority is reducing foot movement inside the shoe while keeping heat manageable, this category gives you the most direct place to start. It is especially useful when you want one of the easiest performance upgrades in the kit without changing shoes or larger gear choices.",
    relatedGuideSlugs: ["court-sport-essentials-beginners"],
  },
  sweat: {
    slug: "sweat",
    category: "Sweat",
    title: "Sweat Control Gear | PulseGear",
    description: "Shop sweat-control gear from PulseGear for hot runs, court sessions, and training days.",
    updatedAt: "2026-05-20",
    intro:
      "PulseGear sweat-control essentials are designed for heat, repetition, and low-distraction comfort. This collection focuses on headbands and wristbands that help manage moisture early so grip, visibility, and feel stay more consistent as sessions build. The goal is not decorative accessories. It is simple control over sweat during warm runs, hard training blocks, and court sessions where hand feel matters. Products in this range are selected for secure stretch, soft contact surfaces, and packable formats that are easy to rotate through the week. If your current kit starts to break down once heat and humidity rise, this category is the fastest way to tighten up the basics. It also pairs naturally with carry and hydration products when the session setup needs to handle summer conditions more cleanly.",
    relatedGuideSlugs: ["court-sport-essentials-beginners", "summer-run-carry"],
  },
  recovery: {
    slug: "recovery",
    category: "Recovery",
    title: "Recovery Gear | PulseGear",
    description: "Shop recovery gear from PulseGear for cooldowns, travel days, and repeat training blocks.",
    updatedAt: "2026-05-20",
    intro:
      "The recovery collection is built for athletes managing repeat training rather than one-off sessions. PulseGear keeps this range focused on soft compression, light support, and packable formats that fit easily into travel bags and daily routines. The products here are meant to support cooldown windows, travel days, and lower-intensity recovery use without feeling bulky or overly technical. Breathability, easy layering, and comfortable all-day wear matter more than aggressive structure. If you are balancing run volume, gym work, and court sessions across the week, these recovery pieces help round out the kit with practical options that stay useful after the workout is done. Think of this category as the place to finish the system, not just the place to shop after soreness shows up.",
    relatedGuideSlugs: ["choose-knee-support-running"],
  },
};

export const collectionLandingPages: CollectionLandingPage[] = [
  {
    scenario: "running",
    slug: "knee-support",
    pathname: "/collections/running/knee-support",
    title: "Running Knee Support | PulseGear",
    description: "Browse lightweight knee support for running, including sleeves and straps built for stable, breathable miles.",
    updatedAt: "2026-05-20",
    intro:
      "This landing page groups PulseGear support products that make the most sense for running-specific knee support needs. The focus is on breathable compression, targeted hold, and low-bulk fit that stays comfortable over longer efforts. Runners looking for a steadier feel can compare full sleeves against more targeted straps depending on coverage, heat, and how much structure they want during training blocks. Because this page is tuned for run scenarios, the supporting links and product mix stay narrower than the broader support category. Use it when the priority is moving efficiently from general support browsing into options that make sense for road runs, treadmill sessions, and repeat mileage weeks.",
    category: "Support",
    useCase: "Run",
    relatedGuideSlugs: ["choose-knee-support-running", "summer-run-carry"],
  },
  {
    scenario: "running",
    slug: "hydration-belts",
    pathname: "/collections/running/hydration-belts",
    title: "Running Hydration Belts | PulseGear",
    description: "Shop run-ready hydration belts and bottle carry essentials designed for low-bounce comfort.",
    updatedAt: "2026-05-20",
    intro:
      "PulseGear built this running hydration landing page for athletes who want low-bounce carry and cleaner access to fluids during warm-weather miles. Instead of covering the full hydration range, it narrows attention to run-ready products that make sense when hydration and carry overlap. That means belt-first options, stable storage, and related bottle choices that work inside a compact run kit. If your goal is to compare hydration carry based on bounce, access, and heat management rather than general category browsing, this page provides the tighter path. The related guide links below add buying context around what to carry and how to keep the kit lean without losing practical coverage for longer sessions.",
    category: "Hydration",
    useCase: "Run",
    relatedGuideSlugs: ["summer-run-carry"],
  },
  {
    scenario: "court",
    slug: "pickleball-accessories",
    pathname: "/collections/court/pickleball-accessories",
    title: "Pickleball Accessories | PulseGear",
    description: "Browse practical pickleball accessories for court sessions, including support, socks, hydration, and sweat control.",
    updatedAt: "2026-05-20",
    intro:
      "This court landing page is built as a tighter entry point for pickleball and similar stop-start court sessions. Rather than forcing broad category browsing, it pulls attention toward accessories that support grip, movement confidence, hydration, and sweat control during repeated rallies and longer rec play. The products surfaced here are intended to cover the useful edges of a court kit: structured socks, light support, compact hydration, and sweat-management basics. That keeps the page more specific than the full shop while still broad enough to reflect how players actually build a practical session setup. Use it when you want a court-focused view of the catalog without indexing every possible filter combination.",
    useCase: "Court",
    relatedGuideSlugs: ["court-sport-essentials-beginners"],
  },
  {
    scenario: "training",
    slug: "compression-gear",
    pathname: "/collections/training/compression-gear",
    title: "Training Compression Gear | PulseGear",
    description: "Shop compression gear for training days, with lightweight support options designed for gym and repeat-session use.",
    updatedAt: "2026-05-20",
    intro:
      "The training compression landing page narrows the PulseGear catalog to support-led products that make sense for gym work, circuits, and repeat indoor sessions. The emphasis is on breathable compression and secure fit rather than heavy structure, so athletes can compare gear that feels practical under regular training conditions. This page is useful when the broader support category is too wide and the real intent is to find compression options that fit strength work, warm-up blocks, or mixed training weeks. By holding the focus on training scenarios, the supporting content and internal links stay closer to the commercial search intent while still avoiding thin, auto-generated filter pages.",
    category: "Support",
    useCase: "Train",
    relatedGuideSlugs: ["choose-knee-support-running", "court-sport-essentials-beginners"],
  },
];

export function getCollectionLandingPage(scenario: string, slug: string) {
  return collectionLandingPages.find((page) => page.scenario === scenario && page.slug === slug);
}

export function hasCollectionFilterParams(searchParams: CollectionQueryParams) {
  return Boolean(searchParams.sort || searchParams.price || searchParams.size || searchParams.color);
}

export function getRelatedGuidesForSlugs<T extends Pick<Guide, "slug">>(guideSlugs: string[], guides: T[]) {
  return guideSlugs
    .map((slug) => guides.find((guide) => guide.slug === slug))
    .filter((guide): guide is T => Boolean(guide));
}
