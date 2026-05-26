"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";

export function AdminSeoNav() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const zh = locale === "zh";

  const items = [
    { href: "/admin/seo", label: zh ? "总览" : "Overview" },
    { href: "/admin/seo/pages", label: zh ? "页面" : "Pages" },
    { href: "/admin/seo/queries", label: zh ? "查询" : "Queries" },
    { href: "/admin/seo/automation", label: zh ? "自动化" : "Automation" },
    { href: "/admin/seo/issues", label: zh ? "问题" : "Issues" },
    { href: "/admin/seo/opportunities", label: zh ? "机会" : "Opportunities" },
    { href: "/admin/seo/recommendations", label: zh ? "建议" : "Recommendations" },
    { href: "/admin/seo/content-pipeline", label: zh ? "内容" : "Content" },
    { href: "/admin/seo/internal-links", label: zh ? "内链" : "Links" },
    { href: "/admin/seo/change-log", label: zh ? "变更日志" : "Change Log" },
  ];

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
