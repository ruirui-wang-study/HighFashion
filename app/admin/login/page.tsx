"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@pulsegear.local");
  const [password, setPassword] = useState("Admin1234!");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { messages } = useLocale();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const body = (await response.json()) as { success: boolean; error?: { message: string } };
      if (!response.ok || !body.success) {
        throw new Error(body.error?.message ?? messages.admin.login.failed);
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : messages.admin.login.failed);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[1.75rem] bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">{messages.admin.login.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-[-0.05em]">{messages.admin.login.title}</h1>
          </div>
          <LanguageToggle />
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{messages.admin.login.body}</p>
        <div className="mt-8 space-y-4">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{messages.admin.login.email}</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" type="email" required />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{messages.admin.login.password}</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" type="password" required />
          </label>
        </div>
        {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}
        <Button type="submit" className="mt-6 w-full" variant="lime" disabled={pending}>
          {pending ? messages.admin.login.signingIn : messages.admin.login.signIn}
        </Button>
      </form>
    </div>
  );
}
