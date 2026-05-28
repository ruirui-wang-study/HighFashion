"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, CreditCard, Lock, MapPinned, RadioTower, ShieldCheck, Store, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { getAdminCopyConfig, getAdminSettings, updateAdminCopyConfig, updateAdminSettings } from "@/lib/admin-api";
import type { AdminCopyConfig, AdminSettingsInput } from "@/lib/admin-settings-types";
import { Button } from "@/components/ui/button";
import { AdminConnectionBadge } from "./admin-connection-badge";
import { AdminAiProviderConfigEditor } from "./admin-ai-provider-config-editor";
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

export function AdminSettingsPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const localeTag = zh ? "zh-CN" : "en-US";
  const copy = useMemo(
    () => ({
      header: {
        eyebrow: zh ? "平台" : "Platform",
        title: zh ? "设置" : "Settings",
        body: zh
          ? "把店铺行为、后台安全和订单处理的运营默认值持久化，不需要再手改环境变量。"
          : "Persist operational defaults behind storefront behavior, admin security, and order handling without editing environment files.",
      },
      controlTower: {
        eyebrow: zh ? "控制台" : "Control Tower",
        title: zh ? "把运营真正依赖的默认值保存下来" : "Persist the Defaults Operators Actually Depend On.",
        body: zh
          ? "这一层设置现在会真实写入店铺资料、订单运营、结账默认值和后台会话策略。各类外部连接状态也会在这里显示。"
          : "This settings layer now writes real admin-managed configuration for store profile, order operations, checkout defaults, and session policy. Integrations still surface their connection status here.",
        save: zh ? "保存设置" : "Save settings",
        saving: zh ? "保存设置中" : "Saving settings",
        reviewOrderOps: zh ? "查看订单运营" : "Review order ops",
        notSavedYet: zh ? "尚未保存" : "Not saved yet",
        lastSaved: zh ? "最近保存" : "Last saved",
        shippingCountries: zh ? "个配送国家" : "shipping countries",
      },
      integrations: [
        {
          key: "analytics",
          title: zh ? "分析" : "Analytics",
          body: zh ? "GA4 用于会话、加购和漏斗阶段等行为指标。" : "GA4 powers behavioral metrics such as sessions, add to cart, and funnel stages.",
          actionLabel: zh ? "查看分析" : "Review analytics",
          actionHref: "/admin/analytics/sales",
          icon: RadioTower,
          badge: <AdminConnectionBadge ga4={ga4} />,
        },
        {
          key: "seo",
          title: zh ? "搜索可见度" : "Search visibility",
          body: zh ? "Search Console 提供查询和页面表现，SEO 健康检查仍可在本地运行。" : "Search Console powers query and page performance while SEO health remains available locally.",
          actionLabel: zh ? "打开 SEO 中心" : "Open SEO Center",
          actionHref: "/admin/seo",
          icon: ShieldCheck,
          badge: <AdminSearchConsoleBadge connection={searchConsole} />,
        },
        {
          key: "merchant",
          title: zh ? "Merchant Feed" : "Merchant feed",
          body: zh ? "Merchant Center 还未真正接通上传，但就绪度预览已经可用。" : "Merchant Center upload is not wired yet, but readiness review is already live.",
          actionLabel: zh ? "打开 Feed 预览" : "Open feed preview",
          actionHref: "/admin/marketing/merchant-feed",
          icon: MapPinned,
          badge: <AdminMerchantConnectionBadge connection={merchant} />,
        },
        {
          key: "commerce-rules",
          title: zh ? "交易规则引擎" : "Commerce rules engine",
          body: zh ? "集中管理税费、运费和支付方式规则，并支持发布前校验与报价模拟。" : "Manage tax, shipping, and payment rules in one place with validation and quote simulation before publish.",
          actionLabel: zh ? "打开规则引擎" : "Open rules engine",
          actionHref: "/admin/settings/commerce-rules",
          icon: CreditCard,
          badge: <span className="inline-flex rounded-full bg-lime/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-graphite">{zh ? "已接入" : "Available"}</span>,
        },
      ],
      alerts: [
        zh ? "敏感凭据仍应保存在服务端的安全存储里，而不是这个后台表单。" : "Sensitive credentials still belong in a secure server-side store rather than this admin form.",
        zh ? "物流承运商选择和追踪单号同步仍是后续待补的工作。" : "Logistics carrier selection and tracking number sync are still planned follow-up work.",
        zh ? "设置写入已启用审计日志，方便追踪平台默认值变更。" : "Audit logging is enabled for settings writes so platform defaults stay reviewable.",
      ],
      messages: {
        loadFailed: zh ? "加载设置失败" : "Failed to load settings",
        saveFailed: zh ? "保存设置失败" : "Failed to save settings",
        saveSuccess: zh ? "设置已保存" : "Settings saved",
        copySaveFailed: zh ? "保存文案配置失败" : "Failed to save copy config",
        copySaveSuccess: zh ? "文案配置已保存" : "Copy config saved",
      },
      sections: {
        storeProfile: {
          title: zh ? "店铺资料" : "Store profile",
          body: zh ? "前台元信息、客服触点和基础站点 URL 使用的品牌默认值。" : "Brand-facing defaults used by storefront metadata, customer support touchpoints, and base commerce URLs.",
          storefrontUrl: zh ? "店铺 URL" : "Storefront URL",
          supportEmail: zh ? "客服邮箱" : "Support email",
          currency: zh ? "货币" : "Currency",
          timezone: zh ? "时区" : "Timezone",
        },
        fulfillment: {
          title: zh ? "订单与履约" : "Orders and fulfillment",
          body: zh ? "配送国家、履约 SLA 和订单处理策略的运营默认值。" : "Operational defaults for shipping region access, fulfillment SLA, and order handling policy.",
          shippingCountries: zh ? "配送国家" : "Shipping countries",
          shippingCountriesHelper: zh ? "使用逗号分隔 ISO 国家代码。" : "Comma separated ISO country codes.",
          sla: zh ? "履约 SLA 天数" : "Fulfillment SLA days",
          returnsPolicyUrl: zh ? "退货政策 URL" : "Returns policy URL",
          autoFulfill: zh ? "自动履约订单" : "Auto fulfill orders",
          autoFulfillBody: zh ? "在物流和追踪集成完成前，建议保持关闭。" : "Keep disabled until logistics and tracking integrations are in place.",
        },
        payments: {
          title: zh ? "支付与结账" : "Payments and checkout",
          body: zh ? "面向用户的结账默认值，以及支付确认失败时展示的运营提示。" : "Customer-facing checkout defaults and the operational message shown when payment confirmation fails.",
          provider: zh ? "主支付提供方" : "Primary payment provider",
          failureMessage: zh ? "支付失败提示" : "Payment failure message",
          stripeAuto: zh ? "Stripe 自动支付方式" : "Stripe automatic payment methods",
          stripeAutoBody: zh ? "该开关应与当前 Stripe Checkout 集成保持一致。" : "This stays aligned with the current Stripe Checkout integration.",
        },
        adminAccess: {
          title: zh ? "后台访问" : "Admin access",
          body: zh ? "运营后台的会话有效期和审计策略。" : "Session lifetime and audit posture for the operations console.",
          ttl: zh ? "后台会话时长（小时）" : "Admin session TTL hours",
          audit: zh ? "启用审计日志" : "Audit logging enabled",
          auditBody: zh ? "商品、内容、订单和设置等状态变更都应保持可追踪。" : "State-changing actions should remain traceable across products, content, orders, and settings.",
        },
      },
      followUp: {
        eyebrow: zh ? "运营提醒" : "Operational alerts",
        title: zh ? "已知后续事项" : "Known follow-up items",
      },
      savedScope: {
        eyebrow: zh ? "已保存范围" : "Saved scope",
        title: zh ? "这个页面当前真正持久化的内容" : "What This Page Persists Today",
        cards: [
          {
            title: zh ? "店铺资料" : "Store profile",
            body: zh ? "店铺 URL、客服邮箱、货币和时区已经入库。" : "Storefront URL, support inbox, currency, and timezone are now database-backed.",
          },
          {
            title: zh ? "订单默认值" : "Order defaults",
            body: zh ? "配送国家、履约 SLA 和自动履约策略现在都可编辑。" : "Shipping countries, fulfillment SLA, and auto-fulfill policy are now editable.",
          },
          {
            title: zh ? "结账提示" : "Checkout messaging",
            body: zh ? "支付提供方标签和失败提示已存储，后续前台可复用。" : "Payment provider label and failure message are stored for future storefront reuse.",
          },
          {
            title: zh ? "后台策略" : "Admin policy",
            body: zh ? "会话 TTL 和审计日志偏好已进入后台设置表。" : "Session TTL and audit logging preference now live in the admin settings table.",
          },
        ],
      },
      copyConfig: {
        eyebrow: zh ? "文案配置" : "Copy config",
        title: zh ? "可编辑的 UI 文案、SEO 模板和规则" : "Editable UI Copy, SEO Templates, and Rules",
        save: zh ? "保存文案配置" : "Save copy config",
        saving: zh ? "保存文案配置中" : "Saving copy config",
        siteSettings: zh ? "站点设置" : "Site settings",
        uiCopyEn: zh ? "界面文案（英文）" : "UI copy (EN)",
        uiCopyZh: zh ? "界面文案（中文）" : "UI copy (ZH)",
        seoRules: zh ? "SEO 规则" : "SEO rules",
        seoTemplates: zh ? "SEO 模板" : "SEO templates",
      },
    }),
    [zh],
  );

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
        setError(nextError instanceof Error ? nextError.message : copy.messages.loadFailed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [copy.messages.loadFailed]);

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
      setSuccess(copy.messages.saveSuccess);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.messages.saveFailed);
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
      setSuccess(copy.messages.copySaveSuccess);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.messages.copySaveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={copy.header.eyebrow} title={copy.header.title} body={copy.header.body} />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <div className="overflow-hidden rounded-[2rem] bg-graphite text-white shadow-utility">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(183,255,42,.2),_transparent_42%),linear-gradient(135deg,#101720_0%,#0B0F14_60%,#18222D_100%)] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">{copy.controlTower.eyebrow}</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-black uppercase tracking-[-0.05em]">{copy.controlTower.title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">{copy.controlTower.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={saveSettings} variant="lime" disabled={loading || saving}>
                {saving ? copy.controlTower.saving : copy.controlTower.save}
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white hover:text-graphite">
                <Link href="/admin/orders">{copy.controlTower.reviewOrderOps}</Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.14em] text-white/65">
              <span>{lastSavedAt ? `${copy.controlTower.lastSaved} ${new Date(lastSavedAt).toLocaleString(localeTag)}` : copy.controlTower.notSavedYet}</span>
              <span>{settings.shippingCountries.length} {copy.controlTower.shippingCountries}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          {copy.integrations.map(({ key, title, body, badge, actionHref, actionLabel, icon: Icon }) => (
            <section key={key} className="rounded-[2rem] bg-white p-5 shadow-utility">
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
        <SettingsCard icon={Store} title={copy.sections.storeProfile.title} body={copy.sections.storeProfile.body}>
          <LabeledInput label={copy.sections.storeProfile.storefrontUrl} value={settings.storefrontUrl} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, storefrontUrl: value }))} />
          <LabeledInput label={copy.sections.storeProfile.supportEmail} value={settings.supportEmail} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, supportEmail: value }))} />
          <div className="grid gap-3 md:grid-cols-2">
            <LabeledInput label={copy.sections.storeProfile.currency} value={settings.checkoutCurrency} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, checkoutCurrency: value }))} />
            <LabeledInput label={copy.sections.storeProfile.timezone} value={settings.timezone} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, timezone: value }))} />
          </div>
        </SettingsCard>

        <SettingsCard icon={Truck} title={copy.sections.fulfillment.title} body={copy.sections.fulfillment.body}>
          <LabeledInput
            label={copy.sections.fulfillment.shippingCountries}
            helper={copy.sections.fulfillment.shippingCountriesHelper}
            value={settings.shippingCountries.join(", ")}
            disabled={loading || saving}
            onChange={(value) => setSettings((current) => ({
              ...current,
              shippingCountries: value.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean),
            }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <LabeledNumberInput label={copy.sections.fulfillment.sla} value={settings.defaultFulfillmentSlaDays} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, defaultFulfillmentSlaDays: value }))} />
            <LabeledInput label={copy.sections.fulfillment.returnsPolicyUrl} value={settings.returnsPolicyUrl ?? ""} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, returnsPolicyUrl: value || null }))} />
          </div>
          <ToggleRow
            label={copy.sections.fulfillment.autoFulfill}
            body={copy.sections.fulfillment.autoFulfillBody}
            checked={settings.orderAutoFulfill}
            disabled={loading || saving}
            onChange={(checked) => setSettings((current) => ({ ...current, orderAutoFulfill: checked }))}
          />
        </SettingsCard>

        <SettingsCard icon={CreditCard} title={copy.sections.payments.title} body={copy.sections.payments.body}>
          <LabeledInput label={copy.sections.payments.provider} value={settings.primaryPaymentProvider} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, primaryPaymentProvider: value }))} />
          <LabeledTextarea label={copy.sections.payments.failureMessage} value={settings.paymentFailureMessage ?? ""} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, paymentFailureMessage: value || null }))} />
          <ToggleRow
            label={copy.sections.payments.stripeAuto}
            body={copy.sections.payments.stripeAutoBody}
            checked={settings.stripeAutomaticPaymentMethods}
            disabled={loading || saving}
            onChange={(checked) => setSettings((current) => ({ ...current, stripeAutomaticPaymentMethods: checked }))}
          />
        </SettingsCard>

        <SettingsCard icon={Lock} title={copy.sections.adminAccess.title} body={copy.sections.adminAccess.body}>
          <LabeledNumberInput label={copy.sections.adminAccess.ttl} value={settings.adminSessionTtlHours} disabled={loading || saving} onChange={(value) => setSettings((current) => ({ ...current, adminSessionTtlHours: value }))} />
          <ToggleRow
            label={copy.sections.adminAccess.audit}
            body={copy.sections.adminAccess.auditBody}
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
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{copy.followUp.eyebrow}</p>
              <h3 className="mt-1 font-display text-2xl font-black uppercase tracking-[-0.04em] text-graphite">{copy.followUp.title}</h3>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {copy.alerts.map((alert) => (
              <div key={alert} className="rounded-2xl border border-graphite/10 bg-warm px-4 py-4 text-sm leading-6 text-graphite">
                {alert}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-utility">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{copy.savedScope.eyebrow}</p>
          <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-[-0.04em] text-graphite">{copy.savedScope.title}</h3>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {copy.savedScope.cards.map((card) => (
              <RoadmapCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>
        </section>
      </section>

      {copyConfig ? (
        <section className="space-y-4 rounded-[2rem] bg-white p-6 shadow-utility">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{copy.copyConfig.eyebrow}</p>
              <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-[-0.04em] text-graphite">{copy.copyConfig.title}</h3>
            </div>
            <Button variant="lime" onClick={saveCopyConfig} disabled={saving}>
              {saving ? copy.copyConfig.saving : copy.copyConfig.save}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminAiProviderConfigEditor
              zh={zh}
              items={copyConfig.siteSettings}
              onChange={(items) => setCopyConfig((current) => (current ? { ...current, siteSettings: items } : current))}
            />
            <ConfigListEditor title={copy.copyConfig.siteSettings} items={copyConfig.siteSettings} onChange={(items) => setCopyConfig((current) => (current ? { ...current, siteSettings: items } : current))} />
            <ConfigListEditor title={copy.copyConfig.uiCopyEn} items={copyConfig.uiCopy.en} onChange={(items) => setCopyConfig((current) => (current ? { ...current, uiCopy: { ...current.uiCopy, en: items } } : current))} />
            <ConfigListEditor title={copy.copyConfig.uiCopyZh} items={copyConfig.uiCopy.zh} onChange={(items) => setCopyConfig((current) => (current ? { ...current, uiCopy: { ...current.uiCopy, zh: items } } : current))} />
            <ConfigListEditor title={copy.copyConfig.seoRules} items={copyConfig.seoRules} onChange={(items) => setCopyConfig((current) => (current ? { ...current, seoRules: items } : current))} />
            <TemplateListEditor title={copy.copyConfig.seoTemplates} items={copyConfig.contentTemplates} onChange={(items) => setCopyConfig((current) => (current ? { ...current, contentTemplates: items } : current))} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SettingsCard({ icon: Icon, title, body, children }: { icon: typeof Store; title: string; body: string; children: ReactNode }) {
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

function LabeledInput({ label, value, onChange, disabled, helper }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; helper?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
      {helper ? <span className="mt-2 block text-xs text-muted">{helper}</span> : null}
    </label>
  );
}

function LabeledNumberInput({ label, value, onChange, disabled }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input type="number" min={1} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value) || 1)} className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
    </label>
  );
}

function LabeledTextarea({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <textarea value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
    </label>
  );
}

function ToggleRow({ label, body, checked, onChange, disabled }: { label: string; body: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl bg-warm px-4 py-4">
      <span>
        <span className="block text-sm font-bold text-graphite">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-muted">{body}</span>
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 rounded border-graphite/20" />
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
              onChange={(event) => onChange(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, value: event.target.value } : entry)))}
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
              onChange={(event) => onChange(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, value: event.target.value } : entry)))}
              className="mt-2 min-h-24 w-full rounded-2xl border border-graphite/10 bg-white px-4 py-3 text-sm outline-none"
            />
            <span className="mt-2 block text-xs text-muted">{item.key}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
