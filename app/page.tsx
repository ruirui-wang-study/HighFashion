import Link from "next/link";
import { ArrowRight, Dumbbell, Gauge, ShieldCheck, Waves } from "lucide-react";
import type { Metadata } from "next";
import { guides } from "@/data/guides";
import { GuideCard } from "@/components/guide-card";
import { getProducts } from "@/lib/api-client";
import { buildPageMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";

const copy = {
  en: {
    metadataTitle: "PulseGear | Lightweight Support and Carry Essentials",
    metadataDescription: "Shop lightweight support, no-bounce carry gear, hydration, and recovery essentials for running, training, and court sports.",
    eyebrow: "Performance Utility / Summer Training",
    heroTitle: "Gear That Moves With You.",
    heroBody: "Lightweight support and carry essentials for running, training, and court sports.",
    ctas: ["Shop Support Gear", "Build Your Training Kit", "Explore Guides"],
    visualLabel: "Run / Train / Court",
    shopByScenario: "Shop by scenario",
    scenes: ["Run", "Train", "Court", "Recover"],
    benefitsEyebrow: "Benefits",
    benefitsTitle: "Built for motion, not shelf appeal",
    benefits: [
      { icon: ShieldCheck, title: "No-Slip Support", body: "Grip finishes and shaped compression help gear stay planted." },
      { icon: Waves, title: "Breathable Compression", body: "Mapped knit zones keep support light for summer sessions." },
      { icon: Gauge, title: "No-Bounce Carry", body: "Low-profile storage keeps essentials close to your center of motion." },
      { icon: Dumbbell, title: "Sweat-Ready Materials", body: "Quick-dry fabrics and easy-care finishes for repeat training days." },
    ],
    bundlesEyebrow: "Kit bundles",
    bundlesTitle: "Build around the way you move",
    bundles: ["Summer Run Kit", "Court Support Kit", "Gym Stability Kit"],
    bundlePrefix: "Bundle",
    bundleBody: "Support + carry + sweat-ready add-ons for a cleaner kit.",
    shopKit: "Shop kit",
    reviewsEyebrow: "Reviews",
    reviewsTitle: "Field notes from training days",
    reviewsBody: "Mock UGC blocks show where customer photos and verified reviews will live once connected to a review platform.",
    reviewQuotes: [
      "Stayed put through intervals.",
      "The belt feels invisible after the first mile.",
      "Clean kit for tennis and gym days.",
      "Good compression without heat buildup.",
    ],
    verifiedReview: "Verified training review",
    guidesEyebrow: "Guides",
    guidesTitle: "Buy with fit context",
    guidesBody: "Short, practical guides help customers choose the right support level and kit setup.",
    browseGuides: "Browse all guides",
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
  zh: {
    metadataTitle: "PulseGear | 轻量支撑与收纳装备",
    metadataDescription: "选购适用于跑步、训练和球类运动的轻量支撑、稳固收纳、补水与恢复装备。",
    eyebrow: "性能机能 / 夏季训练",
    heroTitle: "让装备真正跟着动作走。",
    heroBody: "面向跑步、训练与球类运动的轻量支撑与收纳装备。",
    ctas: ["选购支撑装备", "搭建你的训练套装", "查看训练指南"],
    visualLabel: "跑步 / 训练 / 球场",
    shopByScenario: "按场景选购",
    scenes: ["跑步", "训练", "球场", "恢复"],
    benefitsEyebrow: "核心优势",
    benefitsTitle: "为真实运动打造，而不是只为陈列",
    benefits: [
      { icon: ShieldCheck, title: "稳固不打滑", body: "抓附细节与贴合压缩结构，让装备在动作中保持稳定。" },
      { icon: Waves, title: "透气压缩", body: "分区编织让支撑在夏季训练中依然轻盈透气。" },
      { icon: Gauge, title: "收纳不晃动", body: "低轮廓收纳结构让随身物品更贴近身体重心。" },
      { icon: Dumbbell, title: "适合高频出汗训练", body: "快干面料和易打理细节，适配重复训练日常。" },
    ],
    bundlesEyebrow: "套装组合",
    bundlesTitle: "围绕你的运动方式来搭配",
    bundles: ["夏季跑步套装", "球场支撑套装", "健身稳定套装"],
    bundlePrefix: "组合",
    bundleBody: "把支撑、收纳和吸汗配件搭成更清爽的一整套。",
    shopKit: "选购套装",
    reviewsEyebrow: "用户反馈",
    reviewsTitle: "来自训练现场的使用感受",
    reviewsBody: "这些 mock UGC 区块预留给后续接入的用户照片和真实评价。",
    reviewQuotes: [
      "间歇训练里一直很稳。",
      "腰带跑起来几乎没有存在感。",
      "打网球和去健身房都很顺手。",
      "有压缩感，但不会闷热。",
    ],
    verifiedReview: "训练用户评价",
    guidesEyebrow: "训练指南",
    guidesTitle: "带着尺码和场景判断去购买",
    guidesBody: "用简短直接的指南帮助用户判断支撑等级和装备组合。",
    browseGuides: "查看全部指南",
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
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const content = copy[locale];
  return buildPageMetadata({
    title: content.metadataTitle,
    description: content.metadataDescription,
    pathname: "/",
  });
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const content = copy[locale];
  const bestSellersPromise = getProducts({ sort: "best" }).catch(() => []);
  return (
    <>
      <Section className="overflow-hidden pt-8 lg:pt-12">
        <Container className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-signal">{content.eyebrow}</p>
            <h1 className="font-display text-6xl font-black uppercase leading-[0.82] tracking-[-0.07em] sm:text-7xl lg:text-8xl">{content.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{content.heroBody}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" variant="lime"><Link href="/collections/support">{content.ctas[0]}</Link></Button><Button asChild size="lg" variant="outline"><Link href="/shop">{content.ctas[1]}</Link></Button><Button asChild size="lg" variant="outline"><Link href="/guides">{content.ctas[2]}</Link></Button></div>
          </div>
          <ProductVisual label={content.visualLabel} className="min-h-[520px]" />
        </Container>
      </Section>
      <Section className="pt-0"><Container><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{content.scenes.map((scene, index) => <Link key={scene} href={`/shop?useCase=${["Run", "Train", "Court", "Recovery"][index]}`} className="group rounded-[1.5rem] bg-graphite p-5 text-white speed-lines"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">{content.shopByScenario}</p><p className="mt-12 font-display text-4xl font-black uppercase tracking-[-0.05em]">{scene}</p><ArrowRight className="mt-4 transition group-hover:translate-x-2" /></Link>)}</div></Container></Section>
      <BestSellers productsPromise={bestSellersPromise} content={content} />
      <Section className="bg-white"><Container><SectionHeader eyebrow={content.benefitsEyebrow} title={content.benefitsTitle} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{content.benefits.map(({ icon: Icon, title, body }) => <div key={title} className="rounded-[1.5rem] border border-graphite/10 bg-warm p-5"><Icon className="h-7 w-7 text-signal" /><p className="mt-8 font-display text-2xl font-black uppercase tracking-[-0.04em]">{title}</p><p className="mt-3 text-sm leading-6 text-muted">{body}</p></div>)}</div></Container></Section>
      <Section><Container><SectionHeader eyebrow={content.bundlesEyebrow} title={content.bundlesTitle} /><div className="grid gap-5 lg:grid-cols-3">{content.bundles.map((bundle, index) => <div key={bundle} className="rounded-[1.75rem] bg-graphite p-6 text-white speed-lines"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">{content.bundlePrefix} {index + 1}</p><p className="mt-20 font-display text-4xl font-black uppercase tracking-[-0.05em]">{bundle}</p><p className="mt-3 text-white/65">{content.bundleBody}</p><Button asChild className="mt-6" variant="lime"><Link href="/shop">{content.shopKit}</Link></Button></div>)}</div></Container></Section>
      <Comparison productsPromise={bestSellersPromise} content={content} />
      <Section><Container className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div><SectionHeader eyebrow={content.reviewsEyebrow} title={content.reviewsTitle} body={content.reviewsBody} /></div><div className="grid gap-4 sm:grid-cols-2">{content.reviewQuotes.map((quote) => <div key={quote} className="rounded-[1.5rem] bg-white p-5"><div className="mb-4 h-32 rounded-2xl bg-graphite speed-lines" /><p className="font-bold">{quote}</p><p className="mt-2 text-sm text-muted">{content.verifiedReview}</p></div>)}</div></Container></Section>
      <Section className="bg-graphite text-white"><Container><SectionHeader eyebrow={content.guidesEyebrow} title={content.guidesTitle} body={content.guidesBody} /><div className="grid gap-4 lg:grid-cols-3">{guides.slice(0, 3).map((guide) => <GuideCard key={guide.slug} guide={guide} variant="dark" />)}</div><div className="mt-6"><Button asChild variant="lime"><Link href="/guides">{content.browseGuides}</Link></Button></div></Container></Section>
    </>
  );
}

async function BestSellers({ productsPromise, content }: { productsPromise: ReturnType<typeof getProducts>; content: (typeof copy)["en"] | (typeof copy)["zh"] }) {
  const products = (await productsPromise).slice(0, 4);
  return <Section><Container><SectionHeader eyebrow={content.bestSellersEyebrow} title={content.bestSellersTitle} body={content.bestSellersBody} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></Container></Section>;
}

async function Comparison({ productsPromise, content }: { productsPromise: ReturnType<typeof getProducts>; content: (typeof copy)["en"] | (typeof copy)["zh"] }) {
  const products = (await productsPromise).slice(0, 5);
  return <Section className="bg-white"><Container><SectionHeader eyebrow={content.compareEyebrow} title={content.compareTitle} /><div className="overflow-hidden rounded-[1.5rem] border border-graphite/10"><div className="grid grid-cols-4 bg-graphite p-4 text-xs font-bold uppercase tracking-[0.16em] text-white"><span>{content.compareTable[0]}</span><span>{content.compareTable[1]}</span><span>{content.compareTable[2]}</span><span>{content.compareTable[3]}</span></div>{products.map((product) => <div key={product.id} className="grid grid-cols-4 border-t border-graphite/10 bg-warm p-4 text-sm"><span className="font-bold">{product.title}</span><span>{product.useCases.join(", ")}</span><span>{product.category === "Support" || product.category === "Recovery" ? content.compareSupportHigh : content.compareSupportLight}</span><span>{product.category === "Carry" || product.category === "Hydration" ? content.compareCarryYes : content.compareCarryNo}</span></div>)}</div></Container></Section>;
}

