"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/product-research/dashboard", label: "Dashboard" },
  { href: "/admin/product-research/candidates", label: "Candidates" },
  { href: "/admin/product-research/import", label: "Import" },
  { href: "/admin/product-research/suppliers", label: "Suppliers" },
  { href: "/admin/product-research/scoring-rules", label: "Scoring Rules" },
  { href: "/admin/product-research/risk-review", label: "Risk Review" },
  { href: "/admin/product-research/test-launches", label: "Test Launches" },
  { href: "/admin/product-research/decisions", label: "Decisions" },
];

export function AdminProductResearchNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
              active ? "bg-lime text-graphite" : "bg-white text-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
