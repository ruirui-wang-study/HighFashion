"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "./locale-provider";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, messages } = useLocale();

  return (
    <div className={cn("inline-flex items-center rounded-full border border-graphite/10 bg-white p-1", className)}>
      <span className="sr-only">{messages.language.label}</span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${locale === "en" ? "bg-graphite text-white" : "text-graphite/65"}`}
      >
        {messages.language.en}
      </button>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.12em] ${locale === "zh" ? "bg-graphite text-white" : "text-graphite/65"}`}
      >
        {messages.language.zh}
      </button>
    </div>
  );
}
