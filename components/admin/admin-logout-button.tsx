"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export function AdminLogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { messages } = useLocale();

  async function logout() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(messages.admin.logout.unavailable);
      }
    } catch {
      setError(messages.admin.logout.unavailable);
    } finally {
      router.push("/admin/login");
      router.refresh();
      setPending(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Button variant="outline" onClick={logout} disabled={pending}>
        {pending ? messages.admin.logout.signingOut : messages.admin.logout.signOut}
      </Button>
      {error ? <p className="text-xs font-bold text-red-700">{error}</p> : null}
    </div>
  );
}
