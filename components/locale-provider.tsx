"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { localeCookieName, localeMessages, normalizeLocale, type Locale, type LocaleMessages } from "@/lib/i18n";
import type { PublicSiteCopySnapshot } from "@/lib/storefront-settings";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: LocaleMessages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  siteCopyByLocale,
  children,
}: {
  initialLocale: Locale;
  siteCopyByLocale?: Partial<Record<Locale, PublicSiteCopySnapshot | null>>;
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
    messages: mergeLocaleMessages(localeMessages[locale], siteCopyByLocale?.[locale]),
  }), [locale, siteCopyByLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

function mergeLocaleMessages(messages: LocaleMessages, siteCopy?: PublicSiteCopySnapshot | null): LocaleMessages {
  if (!siteCopy) return messages;
  return {
    ...messages,
    language: {
      label: siteCopy.storefront.languageLabel,
      en: siteCopy.storefront.languageEn,
      zh: siteCopy.storefront.languageZh,
    },
    site: {
      ...messages.site,
      promo: siteCopy.storefront.promo,
      openCart: siteCopy.storefront.openCart,
      openMenu: siteCopy.storefront.openMenu,
      nav: {
        ...messages.site.nav,
        ...siteCopy.storefront.nav,
      },
      footer: {
        ...messages.site.footer,
        ...siteCopy.storefront.footer,
      },
    },
  };
}
