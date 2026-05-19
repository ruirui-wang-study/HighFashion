import type { Guide } from "@/lib/types";

export const guides: Guide[] = [
  {
    slug: "choose-knee-support-running",
    title: "How to Choose Knee Support for Running",
    dek: "Match support level, fit, and breathability to the way you train.",
    readTime: "4 min read",
    category: "Support",
    sections: [
      { heading: "Start with the feeling you need", body: "A sleeve is best for even compression and warmth. A patella strap is better for targeted below-knee support with less coverage." },
      { heading: "Fit matters more than bulk", body: "Measure around the knee while standing relaxed. Choose a snug fit that stays in place without pinching behind the knee." },
      { heading: "Think about heat", body: "Warm-weather runners should prioritize breathable knit panels and low-profile edges that sit cleanly under shorts or tights." },
    ],
  },
  {
    slug: "summer-run-carry",
    title: "What to Carry on a Summer Run",
    dek: "A lean kit for hydration, phone storage, sweat control, and support.",
    readTime: "3 min read",
    category: "Run",
    sections: [
      { heading: "Keep the kit light", body: "Carry only the essentials: phone, key, one gel for longer runs, hydration, and a sweat-control layer." },
      { heading: "Prevent bounce", body: "Choose belts with stretch compression and stabilized pockets so weight stays close to the body." },
      { heading: "Plan for heat", body: "Use a bottle that is easy to grip and a breathable sock/headband combination for longer warm-weather sessions." },
    ],
  },
  {
    slug: "court-sport-essentials-beginners",
    title: "Court Sport Essentials for Beginners",
    dek: "Simple support and sweat-control gear for pickleball, tennis, and indoor court sessions.",
    readTime: "5 min read",
    category: "Court",
    sections: [
      { heading: "Support lateral movement", body: "Court sports involve repeated cuts and starts. Knee sleeves and patella straps can add a secure feel without limiting motion." },
      { heading: "Use socks with structure", body: "Look for arch hold, heel reinforcement, and grip zones that help reduce foot movement inside the shoe." },
      { heading: "Manage sweat early", body: "Headbands and wristbands keep hands drier and help maintain grip through longer sessions." },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
