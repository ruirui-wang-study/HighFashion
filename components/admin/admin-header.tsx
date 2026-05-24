"use client";

import { AdminLogoutButton } from "./admin-logout-button";
import type { AdminRoleName } from "@/lib/admin-session";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";

export function AdminHeader({ name, role }: { name: string; role: AdminRoleName }) {
  const { messages } = useLocale();
  return (
    <header className="border-b border-graphite/10 bg-white px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">{messages.admin.roles[role]}</p>
          <h1 className="mt-1 text-2xl font-black text-graphite">{name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <AdminLogoutButton />
        </div>
      </div>
    </header>
  );
}
