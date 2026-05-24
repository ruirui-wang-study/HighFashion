"use client";

import Link from "next/link";
import { Bell, CreditCard, Lock, MapPinned, RadioTower, ShieldCheck, Store, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { getAdminCopyConfig, getAdminSettings, updateAdminCopyConfig, updateAdminSettings } from "@/lib/admin-api";
import type { AdminCopyConfig, AdminSettingsInput } from "@/lib/admin-settings-types";
import { Button } from "@/components/ui/button";
import { AdminConnectionBadge } from "./admin-connection-badge";
import { AdminMerchantConnectionBadge } from "./admin-merchant-connection-badge";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSearchConsoleBadge } from "./admin-search-console-badge";

const ga4 = { connected: false, status: "Not Connected" as const };
const merchant = { connected: false, status: "Not Connected" as const };
const searchConsole = { connected: false, status: "Not Connected" as const };

const defaultSettings: AdminSettingsInput = {
  storefrontUrl: "http://localhost:3000",
  supportEmail: "support@pulsegear.local",
  checkoutCurrency: "usd",
  timezone: "America/Los_Angeles",
  shippingCountries: ["US", "GB"],
  defaultFulfillmentSlaDays: 3,
  returnsPolicyUrl: "/faq",
  orderAutoFulfill: false,
  primaryPaymentProvider: "Stripe Checkout",
  stripeAutomaticPaymentMethods: true,
  paymentFailureMessage: "Retry checkout from cart if payment is not confirmed.",
  adminSessionTtlHours: 12,
  auditLoggingEnabled: true,
};

const integrationCards = [
  {
    title: "Analytics",
    body: "GA4 powers behavioral metrics such as sessions, add to cart, and funnel stages.",
    badge: <AdminConnectionBadge ga4={ga4} />,
    actionHref: "/admin/analytics/sales",
    actionLabel: "Review analytics",
    icon: RadioTower,
  },
  {
    title: "Search visibility",
    body: "Search Console powers query and page performance while SEO health remains available locally.",
    badge: <AdminSearchConsoleBadge connection={searchConsole} />,
    actionHref: "/admin/seo",
    actionLabel: "Open SEO Center",
    icon: ShieldCheck,
  },
  {
    title: "Merchant feed",
    body: "Merchant Center upload is not wired yet, but readiness review is already live.",
    badge: <AdminMerchantConnectionBadge connection={merchant} />,
    actionHref: "/admin/marketing/merchant-feed",
    actionLabel: "Open feed preview",
    icon: MapPinned,
  },
];

const alerts = [
  "Sensitive credentials still belong in a secure server-side store rather than this admin form.",
  "Logistics carrier selection and tracking number sync are still planned follow-up work.",
  "Audit logging is enabled for settings writes so platform defaults stay reviewable.",
];

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsInput>(defaultSettings);
  const [copyConfig, setCopyConfig] = useState<AdminCopyConfig | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminSettings()
      .then((data) => {
        if (!active) return;
        setSettings({
          storefrontUrl: data.storefrontUrl,
          supportEmail: data.supportEmail,
          checkoutCurrency: data.checkoutCurrency,
          timezone: data.timezone,
          shippingCountries: data.shippingCountries,
          defaultFulfillmentSlaDays: data.defaultFulfillmentSlaDays,
          returnsPolicyUrl: data.returnsPolicyUrl,
          orderAutoFulfill: data.orderAutoFulfill,
          primaryPaymentProvider: data.primaryPaymentProvider,
          stripeAutomaticPaymentMethods: data.stripeAutomaticPaymentMethods,
          paymentFailureMessage: data.paymentFailureMessage,
          adminSessionTtlHours: data.adminSessionTtlHours,
          auditLoggingEnabled: data.auditLoggingEnabled,
        });
        setLastSavedAt(data.updatedAt);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load settings");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getAdminCopyConfig()
      .then((data) => {
        if (!active) return;
        setCopyConfig(data);
      })
      .catch(() => {
        if (!active) return;
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveSettings() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await updateAdminSettings({
        ...settings,
        checkoutCurrency: settings.checkoutCurrency.trim().toLowerCase(),
        shippingCountries: settings.shippingCountries.filter(Boolean),
      });
      setSettings({
        storefrontUrl: saved.storefrontUrl,
        supportEmail: saved.supportEmail,
        checkoutCurrency: saved.checkoutCurrency,
        timezone: saved.timezone,
        shippingCountries: saved.shippingCountries,
        defaultFulfillmentSlaDays: saved.defaultFulfillmentSlaDays,
        returnsPolicyUrl: saved.returnsPolicyUrl,
        orderAutoFulfill: saved.orderAutoFulfill,
        primaryPaymentProvider: saved.primaryPaymentProvider,
        stripeAutomaticPaymentMethods: saved.stripeAutomaticPaymentMethods,
        paymentFailureMessage: saved.paymentFailureMessage,
        adminSessionTtlHours: saved.adminSessionTtlHours,
        auditLoggingEnabled: saved.auditLoggingEnabled,
      });
      setLastSavedAt(saved.updatedAt);
      setSuccess("Settings saved");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function saveCopyConfig() {
    if (!copyConfig) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const saved = await updateAdminCopyConfig({
        siteSettings: copyConfig.siteSettings,
        uiCopy: copyConfig.uiCopy,
        contentTemplates: copyConfig.contentTemplates,
        seoRules: copyConfig.seoRules,
      });
      setCopyConfig(saved);
      await fetch("/api/admin/revalidate-site-copy", { method: "POST" });
      setSuccess("Copy config saved");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save copy config");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Platform"
        title="Settings"
        body="Persist operational defaults behind storefront behavior, admin security, and order handling without editing environment files."
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <div className="overflow-hidden rounded-[2rem] bg-graphite text-white shadow-utility">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(183,255,42,.2),_transparent_42%),linear-gradient(135deg,#101720_0%,#0B0F14_60%,#18222D_100%)] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Control Tower</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-black uppercase tracking-[-0.05em]">
              Persist the Defaults Operators Actually Depend On.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
              This settings layer now writes real admin-managed configuration for store profile, order operations,
              checkout defaults, and session policy. Integrations still surface their connection status here.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={saveSettings} variant="lime" disabled={loading || saving}>
                {saving ? "Saving settings" : "Save settings"}
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white hover:text-graphite">
                <Link href="/admin/orders">Review order ops</Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.14em] text-white/65">
              <span>{lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleString("en-US")}` : "Not saved yet"}</span>
              <span>{settings.shippingCountries.length} shipping countries</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          {integrationCards.map(({ title, body, badge, actionHref, actionLabel, icon: Icon }) => (
            <section key={title} className="rounded-[2rem] bg-white p-5 shadow-utility">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime/20 text-graphite">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
                  <div className="mt-2">{badge}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{body}</p>
              <div className="mt-5">
                <Button asChild size="sm" variant="ghost">
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>
              </div>
            </section>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
      {success ? <p className="text-sm font-bold text-emerald-700">{success}</p> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <SettingsCard
          icon={Store}
          title="Store profile"
          body="Brand-facing defaults used by storefront metadata, customer support touchpoints, and base commerce URLs."
        >
          <LabeledInput
            label="Storefront URL"
            value={settings.storefrontUrl}
            disabled={loading || saving}
            onChange={(value) => setSettings((current) => ({ ...current, storefrontUrl: value }))}
          />
          <LabeledInput
            label="Support email"
            value={settings.supportEmail}
            disabled={loading || saving}
            onChange={(value) => setSettings((current) => ({ ...current, supportEmail: value }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <LabeledInput
              label="Currency"
              value={settings.checkoutCurrency}
              disabled={loading || saving}
              onChange={(value) => setSettings((current) => ({ ...current, checkoutCurrency: value }))}
            />
            <LabeledInput
              label="Timezone"
              value={settings.timezone}
              disabled={loading || saving}
              onChange={(value) => setSettings((current) => ({ ...current, timezone: value }))}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={Truck}
          title="Orders and fulfillment"
          body="Operational defaults for shipping region access, fulfillment SLA, and order handling policy."
        >
          <LabeledInput
            label="Shipping countries"
            helper="Comma separated ISO country codes."
            value={settings.shippingCountries.join(", ")}
            disabled={loading || saving}
            onChange={(value) => setSettings((current) => ({
              ...current,
              shippingCountries: value.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean),
            }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <LabeledNumberInput
              label="Fulfillment SLA days"
              value={settings.defaultFulfillmentSlaDays}
              disabled={loading || saving}
              onChange={(value) => setSettings((current) => ({ ...current, defaultFulfillmentSlaDays: value }))}
            />
            <LabeledInput
              label="Returns policy URL"
              value={settings.returnsPolicyUrl ?? ""}
              disabled={loading || saving}
              onChange={(value) => setSettings((current) => ({ ...current, returnsPolicyUrl: value || null }))}
            />
          </div>
          <ToggleRow
            label="Auto fulfill orders"
            body="Keep disabled until logistics and tracking integrations are in place."
            checked={settings.orderAutoFulfill}
            disabled={loading || saving}
            onChange={(checked) => setSettings((current) => ({ ...current, orderAutoFulfill: checked }))}
          />
        </SettingsCard>

        <SettingsCard
          icon={CreditCard}
          title="Payments and checkout"
          body="Customer-facing checkout defaults and the operational message shown when payment confirmation fails."
        >
          <LabeledInput
            label="Primary payment provider"
            value={settings.primaryPaymentProvider}
            disabled={loading || saving}
            onChange={(value) => setSettings((current) => ({ ...current, primaryPaymentProvider: value }))}
          />
          <LabeledTextarea
            label="Payment failure message"
            value={settings.paymentFailureMessage ?? ""}
            disabled={loading || saving}
            onChange={(value) => setSettings((current) => ({ ...current, paymentFailureMessage: value || null }))}
          />
          <ToggleRow
            label="Stripe automatic payment methods"
            body="This stays aligned with the current Stripe Checkout integration."
            checked={settings.stripeAutomaticPaymentMethods}
            disabled={loading || saving}
            onChange={(checked) => setSettings((current) => ({ ...current, stripeAutomaticPaymentMethods: checked }))}
          />
        </SettingsCard>

        <SettingsCard
          icon={Lock}
          title="Admin access"
          body="Session lifetime and audit posture for the operations console."
        >
          <LabeledNumberInput
            label="Admin session TTL hours"
            value={settings.adminSessionTtlHours}
            disabled={loading || saving}
            onChange={(value) => setSettings((current) => ({ ...current, adminSessionTtlHours: value }))}
          />
          <ToggleRow
            label="Audit logging enabled"
            body="State-changing actions should remain traceable across products, content, orders, and settings."
            checked={settings.auditLoggingEnabled}
            disabled={loading || saving}
            onChange={(checked) => setSettings((current) => ({ ...current, auditLoggingEnabled: checked }))}
          />
        </SettingsCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-utility">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime/20 text-graphite">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Operational alerts</p>
              <h3 className="mt-1 font-display text-2xl font-black uppercase tracking-[-0.04em] text-graphite">Known follow-up items</h3>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {alerts.map((alert) => (
              <div key={alert} className="rounded-2xl border border-graphite/10 bg-warm px-4 py-4 text-sm leading-6 text-graphite">
                {alert}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-utility">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Saved scope</p>
          <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-[-0.04em] text-graphite">
            What This Page Persists Today
          </h3>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <RoadmapCard title="Store profile" body="Storefront URL, support inbox, currency, and timezone are now database-backed." />
            <RoadmapCard title="Order defaults" body="Shipping countries, fulfillment SLA, and auto-fulfill policy are now editable." />
            <RoadmapCard title="Checkout messaging" body="Payment provider label and failure message are stored for future storefront reuse." />
            <RoadmapCard title="Admin policy" body="Session TTL and audit logging preference now live in the admin settings table." />
          </div>
        </section>
      </section>

      {copyConfig ? (
        <section className="space-y-4 rounded-[2rem] bg-white p-6 shadow-utility">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Copy config</p>
              <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-[-0.04em] text-graphite">
                Editable UI Copy, SEO Templates, and Rules
              </h3>
            </div>
            <Button variant="lime" onClick={saveCopyConfig} disabled={saving}>
              {saving ? "Saving copy config" : "Save copy config"}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ConfigListEditor
              title="Site settings"
              items={copyConfig.siteSettings}
              onChange={(items) => setCopyConfig((current) => (current ? { ...current, siteSettings: items } : current))}
            />
            <ConfigListEditor
              title="UI copy"
              items={copyConfig.uiCopy}
              onChange={(items) => setCopyConfig((current) => (current ? { ...current, uiCopy: items } : current))}
            />
            <ConfigListEditor
              title="SEO rules"
              items={copyConfig.seoRules}
              onChange={(items) => setCopyConfig((current) => (current ? { ...current, seoRules: items } : current))}
            />
            <TemplateListEditor
              title="SEO templates"
              items={copyConfig.contentTemplates}
              onChange={(items) => setCopyConfig((current) => (current ? { ...current, contentTemplates: items } : current))}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: typeof Store;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-utility">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-graphite text-lime">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-2xl font-black uppercase tracking-[-0.04em] text-graphite">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  disabled,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
      />
      {helper ? <span className="mt-2 block text-xs text-muted">{helper}</span> : null}
    </label>
  );
}

function LabeledNumberInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input
        type="number"
        min={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value) || 1)}
        className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
      />
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-28 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
      />
    </label>
  );
}

function ToggleRow({
  label,
  body,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  body: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl bg-warm px-4 py-4">
      <span>
        <span className="block text-sm font-bold text-graphite">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-muted">{body}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 rounded border-graphite/20"
      />
    </label>
  );
}

function RoadmapCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-graphite px-5 py-5 text-white">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-lime">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/75">{body}</p>
    </div>
  );
}

function ConfigListEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: Array<{ key: string; value: string | number | boolean | null }>;
  onChange: (items: Array<{ key: string; value: string | number | boolean | null }>) => void;
}) {
  return (
    <section className="rounded-2xl bg-warm p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <label key={item.key} className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{item.key}</span>
            <input
              value={String(item.value ?? "")}
              onChange={(event) =>
                onChange(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, value: event.target.value } : entry)))
              }
              className="mt-2 w-full rounded-2xl border border-graphite/10 bg-white px-4 py-3 text-sm outline-none"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function TemplateListEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: Array<{ key: string; name: string; value: string; status?: string }>;
  onChange: (items: Array<{ key: string; name: string; value: string; status?: string }>) => void;
}) {
  return (
    <section className="rounded-2xl bg-warm p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <label key={item.key} className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{item.name}</span>
            <textarea
              value={item.value}
              onChange={(event) =>
                onChange(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, value: event.target.value } : entry)))
              }
              className="mt-2 min-h-24 w-full rounded-2xl border border-graphite/10 bg-white px-4 py-3 text-sm outline-none"
            />
            <span className="mt-2 block text-xs text-muted">{item.key}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
