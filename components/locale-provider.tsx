"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { localeCookieName, localeMessages, normalizeLocale, type Locale } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: (typeof localeMessages)[Locale];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: (nextLocale) => setLocaleState(normalizeLocale(nextLocale)),
    messages: localeMessages[locale],
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
