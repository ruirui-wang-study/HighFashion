"use client";

import Link from "next/link";
import { getAdminNavForRole } from "@/lib/admin-rbac";
import type { AdminRoleName } from "@/lib/admin-session";
import { useLocale } from "@/components/locale-provider";

export function AdminSidebar({ role }: { role: AdminRoleName }) {
  const items = getAdminNavForRole(role);
  const { messages } = useLocale();

  return (
    <aside className="w-64 border-r border-graphite/10 bg-white">
      <div className="border-b border-graphite/10 px-6 py-5">
        <p className="font-display text-2xl font-black uppercase tracking-[-0.05em]">
          Pulse<span className="text-signal">Gear</span>
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">{messages.admin.shell.admin}</p>
      </div>
      <nav className="grid gap-2 p-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-graphite transition hover:bg-warm"
          >
            {messages.admin.nav[item.href as keyof typeof messages.admin.nav] ?? item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
