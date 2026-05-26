export type AboutStaticPageContent = {
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  paragraphs: string[];
  visualLabel: string;
};

export type FitGuideCard = {
  title: string;
};

export type FitGuideRow = {
  product: string;
  measure: string;
  fitCheck: string;
};

export type FitGuideStaticPageContent = {
  eyebrow: string;
  title: string;
  body: string;
  cards: FitGuideCard[];
  headers: {
    product: string;
    measure: string;
    fitCheck: string;
  };
  rows: FitGuideRow[];
};

export type HomePageBenefitItem = {
  title: string;
  body: string;
};

export type HomePageBundleItem = {
  title: string;
};

export type HomePageReviewItem = {
  quote: string;
};

export type HomePageStaticPageContent = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  ctas: [string, string, string];
  visualLabel: string;
  shopByScenario: string;
  scenes: [string, string, string, string];
  scenarioLinks: [string, string, string, string];
  benefitsEyebrow: string;
  benefitsTitle: string;
  benefits: [HomePageBenefitItem, HomePageBenefitItem, HomePageBenefitItem, HomePageBenefitItem];
  bundlesEyebrow: string;
  bundlesTitle: string;
  bundles: [HomePageBundleItem, HomePageBundleItem, HomePageBundleItem];
  bundlePrefix: string;
  bundleBody: string;
  shopKit: string;
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviewsBody: string;
  showReviews: boolean;
  reviewQuotes: [HomePageReviewItem, HomePageReviewItem, HomePageReviewItem, HomePageReviewItem];
  verifiedReview: string;
  guidesEyebrow: string;
  guidesTitle: string;
  guidesBody: string;
  browseGuides: string;
  featuredGuideSlugs: [string, string, string];
  bestSellersEyebrow: string;
  bestSellersTitle: string;
  bestSellersBody: string;
  compareEyebrow: string;
  compareTitle: string;
  compareTable: [string, string, string, string];
  compareSupportHigh: string;
  compareSupportLight: string;
  compareCarryYes: string;
  compareCarryNo: string;
};

export type StaticPageKey = "ABOUT" | "FIT_GUIDE" | "HOME_PAGE";

export type ManagedStaticPageDefinition =
  | {
      pageKey: "ABOUT";
      slug: "about";
      pathname: "/about";
      title: string;
      seoTitle: string;
      seoDescription: string;
      content: AboutStaticPageContent;
      contentZh?: AboutStaticPageContent;
      updatedAt: string;
    }
  | {
      pageKey: "FIT_GUIDE";
      slug: "fit-guide";
      pathname: "/fit-guide";
      title: string;
      seoTitle: string;
      seoDescription: string;
      content: FitGuideStaticPageContent;
      contentZh?: FitGuideStaticPageContent;
      updatedAt: string;
    }
  | {
      pageKey: "HOME_PAGE";
      slug: "home";
      pathname: "/";
      title: string;
      seoTitle: string;
      seoDescription: string;
      content: HomePageStaticPageContent;
      contentZh?: HomePageStaticPageContent;
      updatedAt: string;
    };

export const managedStaticPages: ManagedStaticPageDefinition[] = [
  {
    pageKey: "ABOUT",
    slug: "about",
    pathname: "/about",
    title: "About PulseGear",
    seoTitle: "About PulseGear",
    seoDescription:
      "Learn how PulseGear designs lightweight support, carry, hydration, and sweat-control essentials for repeat training days.",
    content: {
      eyebrow: "About PulseGear",
      heroTitle: "Lightweight utility for repeat training days",
      heroBody:
        "PulseGear focuses on compact support, carry, hydration, and sweat-control essentials. The assortment is intentionally narrow so the store feels like a performance brand, not a marketplace.",
      paragraphs: [
        "We design around running, training, court movement, and recovery routines.",
        "Every product page explains fit, use case, materials, and care in concise language.",
        "The storefront is built to keep product context clear, mobile-first, and useful for repeat purchase categories.",
      ],
      visualLabel: "Performance Utility",
    },
    contentZh: {
      eyebrow: "关于 PulseGear",
      heroTitle: "为高频训练打造的轻量机能装备",
      heroBody:
        "PulseGear 聚焦紧凑型支撑、收纳、补水和吸汗配件。产品线刻意保持克制，让整站更像专业运动品牌，而不是泛化商品市场。",
      paragraphs: [
        "我们的设计始终围绕跑步、训练、球场移动与恢复场景展开。",
        "每个商品页面都会用简洁语言说明尺码、使用场景、材质与护理方式。",
        "整站的目标是让核心品类在移动端也能快速理解、快速选购，并保持长期复购的内容清晰度。",
      ],
      visualLabel: "性能机能",
    },
    updatedAt: "2026-05-25",
  },
  {
    pageKey: "HOME_PAGE",
    slug: "home",
    pathname: "/",
    title: "Home Page",
    seoTitle: "PulseGear | Lightweight Support and Carry Essentials",
    seoDescription:
      "Shop lightweight support, no-bounce carry gear, hydration, and recovery essentials for running, training, and court sports.",
    content: {
      metadataTitle: "PulseGear | Lightweight Support and Carry Essentials",
      metadataDescription: "Shop lightweight support, no-bounce carry gear, hydration, and recovery essentials for running, training, and court sports.",
      eyebrow: "Performance Utility / Summer Training",
      heroTitle: "Gear That Moves With You.",
      heroBody: "Lightweight support and carry essentials for running, training, and court sports.",
      ctas: ["Shop Support Gear", "Build Your Training Kit", "Explore Guides"],
      visualLabel: "Run / Train / Court",
      shopByScenario: "Shop by scenario",
      scenes: ["Run", "Train", "Court", "Recover"],
      scenarioLinks: ["/shop?useCase=Run", "/shop?useCase=Train", "/shop?useCase=Court", "/shop?useCase=Recovery"],
      benefitsEyebrow: "Benefits",
      benefitsTitle: "Built for motion, not shelf appeal",
      benefits: [
        { title: "No-Slip Support", body: "Grip finishes and shaped compression help gear stay planted." },
        { title: "Breathable Compression", body: "Mapped knit zones keep support light for summer sessions." },
        { title: "No-Bounce Carry", body: "Low-profile storage keeps essentials close to your center of motion." },
        { title: "Sweat-Ready Materials", body: "Quick-dry fabrics and easy-care finishes for repeat training days." },
      ],
      bundlesEyebrow: "Kit bundles",
      bundlesTitle: "Build around the way you move",
      bundles: [{ title: "Summer Run Kit" }, { title: "Court Support Kit" }, { title: "Gym Stability Kit" }],
      bundlePrefix: "Bundle",
      bundleBody: "Support + carry + sweat-ready add-ons for a cleaner kit.",
      shopKit: "Shop kit",
      reviewsEyebrow: "Reviews",
      reviewsTitle: "Field notes from training days",
      reviewsBody: "Mock UGC blocks show where customer photos and verified reviews will live once connected to a review platform.",
      showReviews: true,
      reviewQuotes: [
        { quote: "Stayed put through intervals." },
        { quote: "The belt feels invisible after the first mile." },
        { quote: "Clean kit for tennis and gym days." },
        { quote: "Good compression without heat buildup." },
      ],
      verifiedReview: "Verified training review",
      guidesEyebrow: "Guides",
      guidesTitle: "Buy with fit context",
      guidesBody: "Short, practical guides help customers choose the right support level and kit setup.",
      browseGuides: "Browse all guides",
      featuredGuideSlugs: ["choose-knee-support-running", "summer-run-carry", "court-sport-essentials-beginners"],
      bestSellersEyebrow: "Best sellers",
      bestSellersTitle: "High-frequency training essentials",
      bestSellersBody: "A focused kit of support, carry, hydration, and sweat-control products for warm-weather sessions.",
      compareEyebrow: "Compare",
      compareTitle: "Choose by training need",
      compareTable: ["Product", "Best for", "Support", "Carry"],
      compareSupportHigh: "High",
      compareSupportLight: "Light",
      compareCarryYes: "Yes",
      compareCarryNo: "No",
    },
    contentZh: {
      metadataTitle: "PulseGear | 轻量支撑与收纳装备",
      metadataDescription: "选购适用于跑步、训练和球类运动的轻量支撑、稳固收纳、补水与恢复装备。",
      eyebrow: "Performance Utility / 夏季训练",
      heroTitle: "让装备真正跟着动作走。",
      heroBody: "面向跑步、训练与球类运动的轻量支撑与收纳装备。",
      ctas: ["选购支撑装备", "搭建你的训练套装", "查看训练指南"],
      visualLabel: "跑步 / 训练 / 球场",
      shopByScenario: "按场景选购",
      scenes: ["跑步", "训练", "球场", "恢复"],
      scenarioLinks: ["/shop?useCase=Run", "/shop?useCase=Train", "/shop?useCase=Court", "/shop?useCase=Recovery"],
      benefitsEyebrow: "核心优势",
      benefitsTitle: "为真实运动打造，而不是只为陈列",
      benefits: [
        { title: "稳固不打滑", body: "抓附细节与贴合压缩结构，让装备在动作中保持稳定。" },
        { title: "透气压缩", body: "分区编织让支撑在夏季训练中依然轻盈透气。" },
        { title: "收纳不晃动", body: "低轮廓收纳结构让随身物品更贴近身体重心。" },
        { title: "适合高频出汗训练", body: "快干面料和易打理细节，适配重复训练日常。" },
      ],
      bundlesEyebrow: "套装组合",
      bundlesTitle: "围绕你的运动方式来搭配",
      bundles: [{ title: "夏季跑步套装" }, { title: "球场支撑套装" }, { title: "健身稳定套装" }],
      bundlePrefix: "组合",
      bundleBody: "把支撑、收纳和吸汗配件搭成更清洁的一整套。",
      shopKit: "选购套装",
      reviewsEyebrow: "用户反馈",
      reviewsTitle: "来自训练现场的使用感受",
      reviewsBody: "这些 mock UGC 区块预留给后续接入的用户照片和真实评价。",
      showReviews: true,
      reviewQuotes: [
        { quote: "间歇训练里一直很稳。" },
        { quote: "腰带跑起来几乎没有存在感。" },
        { quote: "打网球和去健身房都很顺手。" },
        { quote: "有压缩感，但不会闷热。" },
      ],
      verifiedReview: "训练用户评价",
      guidesEyebrow: "训练指南",
      guidesTitle: "带着尺码和场景判断去购买",
      guidesBody: "用简短直接的指南帮助用户判断支撑等级和装备组合。",
      browseGuides: "查看全部指南",
      featuredGuideSlugs: ["choose-knee-support-running", "summer-run-carry", "court-sport-essentials-beginners"],
      bestSellersEyebrow: "热卖产品",
      bestSellersTitle: "高频训练最常用的装备",
      bestSellersBody: "围绕夏季训练场景挑出一套聚焦的支撑、收纳、补水和吸汗装备。",
      compareEyebrow: "对比",
      compareTitle: "按训练需求做选择",
      compareTable: ["产品", "适用场景", "支撑强度", "收纳能力"],
      compareSupportHigh: "高",
      compareSupportLight: "轻",
      compareCarryYes: "有",
      compareCarryNo: "无",
    },
    updatedAt: "2026-05-25",
  },
  {
    pageKey: "FIT_GUIDE",
    slug: "fit-guide",
    pathname: "/fit-guide",
    title: "Fit Guide",
    seoTitle: "Fit Guide",
    seoDescription:
      "Use the PulseGear fit guide to choose support, carry, and sock sizes by measurement and movement.",
    content: {
      eyebrow: "Fit Guide",
      title: "Choose support by measurement and movement",
      body:
        "Use these quick checks before selecting a size. Product pages use button groups for fast size selection on mobile.",
      cards: [
        { title: "Measure relaxed" },
        { title: "Check range of motion" },
        { title: "Fit should stay planted" },
      ],
      headers: {
        product: "Product",
        measure: "Measure",
        fitCheck: "Fit check",
      },
      rows: [
        {
          product: "Knee sleeve",
          measure: "Measure around the kneecap while standing",
          fitCheck: "Snug compression, no pinching behind knee",
        },
        {
          product: "Patella strap",
          measure: "Measure below kneecap around upper shin",
          fitCheck: "Targeted pressure without numbness",
        },
        {
          product: "Running belt",
          measure: "Measure natural waist over run shorts",
          fitCheck: "Secure hold with room to breathe",
        },
        {
          product: "Socks",
          measure: "Match shoe size range",
          fitCheck: "Heel sits locked, toe seam stays flat",
        },
      ],
    },
    contentZh: {
      eyebrow: "尺码指南",
      title: "按围度与动作选择更稳妥的运动装备",
      body:
        "下单前先做这些快速检查。商品详情页会继续使用按钮组做尺码选择，方便移动端快速判断。",
      cards: [
        { title: "自然站姿测量" },
        { title: "确认活动范围" },
        { title: "贴合但不位移" },
      ],
      headers: {
        product: "产品",
        measure: "测量方式",
        fitCheck: "贴合检查",
      },
      rows: [
        {
          product: "护膝套",
          measure: "站立时围绕膝盖中部测量",
          fitCheck: "有压缩感，但膝后不勒不夹",
        },
        {
          product: "髌骨带",
          measure: "在膝盖下方、小腿上缘处环绕测量",
          fitCheck: "有针对性支撑，但不能发麻",
        },
        {
          product: "跑步腰包",
          measure: "沿自然腰线、跑步短裤外侧测量",
          fitCheck: "贴身稳固，同时保留呼吸空间",
        },
        {
          product: "运动袜",
          measure: "按鞋码区间选择",
          fitCheck: "后跟锁定，脚趾缝线保持平整",
        },
      ],
    },
    updatedAt: "2026-05-25",
  },
];

export function getManagedStaticPageByPathname(pathname: string) {
  return managedStaticPages.find((page) => page.pathname === pathname) ?? null;
}
