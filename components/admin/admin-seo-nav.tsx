"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/seo", label: "Overview" },
  { href: "/admin/seo/pages", label: "Pages" },
  { href: "/admin/seo/queries", label: "Queries" },
  { href: "/admin/seo/automation", label: "Automation" },
  { href: "/admin/seo/issues", label: "Issues" },
  { href: "/admin/seo/opportunities", label: "Opportunities" },
  { href: "/admin/seo/recommendations", label: "Recommendations" },
  { href: "/admin/seo/content-pipeline", label: "Content" },
  { href: "/admin/seo/internal-links", label: "Links" },
  { href: "/admin/seo/change-log", label: "Change Log" },
];

export function AdminSeoNav() {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
            pathname === item.href ? "bg-graphite text-white" : "bg-warm text-muted"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
