"use client";

import { useEffect, useState } from "react";
import {
  generateSeoOpportunities,
  generateSeoRecommendations,
  getSeoAutomationOverview,
  runSeoHealthCheck,
  syncSeoGa4,
  syncSeoGsc,
} from "@/lib/admin-api";
import type { SeoAutomationOverview } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoAutomationPageClient() {
  const [data, setData] = useState<SeoAutomationOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setData(await getSeoAutomationOverview());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load SEO automation overview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getSeoAutomationOverview()
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load SEO automation overview");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function runAction(action: string, handler: () => Promise<unknown>) {
    setBusy(action);
    setError(null);
    try {
      await handler();
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Growth"
        title="SEO Automation"
        body="Run health checks, sync Google data, generate opportunities, and keep all AI output behind manual review."
      />
      <AdminSeoNav />

      <section className="grid gap-3 rounded-3xl bg-white p-6 xl:grid-cols-5">
        <Button variant="lime" disabled={busy === "health"} onClick={() => void runAction("health", runSeoHealthCheck)}>
          {busy === "health" ? "Running..." : "Run Health Check"}
        </Button>
        <Button variant="ghost" disabled={busy === "gsc"} onClick={() => void runAction("gsc", syncSeoGsc)}>
          {busy === "gsc" ? "Syncing..." : "Sync GSC"}
        </Button>
        <Button variant="ghost" disabled={busy === "ga4"} onClick={() => void runAction("ga4", syncSeoGa4)}>
          {busy === "ga4" ? "Syncing..." : "Sync GA4"}
        </Button>
        <Button variant="ghost" disabled={busy === "opps"} onClick={() => void runAction("opps", generateSeoOpportunities)}>
          {busy === "opps" ? "Generating..." : "Generate Opportunities"}
        </Button>
        <Button variant="ghost" disabled={busy === "recs"} onClick={() => void runAction("recs", generateSeoRecommendations)}>
          {busy === "recs" ? "Generating..." : "Generate Recommendations"}
        </Button>
      </section>

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">Loading automation overview...</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Scanned pages" value={String(data.healthCheck.scannedPages)} note={data.healthCheck.lastRunAt ? `Last run ${new Date(data.healthCheck.lastRunAt).toLocaleString()}` : "Not run yet"} />
            <MetricCard label="Open issues" value={String(data.healthCheck.openIssues)} note={`Average health ${data.healthCheck.averageHealthScore}`} />
            <MetricCard label="Opportunities" value={String(data.opportunities.total)} note={`${data.opportunities.new} new`} />
            <MetricCard label="Draft recommendations" value={String(data.recommendations.draft)} note={`${data.recommendations.total} total`} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
            <div className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Connections</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ConnectionCard title="Google Search Console" status={data.searchConsole.status} />
                <ConnectionCard title="GA4 Data API" status={data.ga4.status} />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Workflow</p>
              <div className="mt-5 space-y-3 text-sm text-muted">
                <p>All generated output is labeled <span className="font-bold text-graphite">AI Draft</span>.</p>
                <p>No SEO field changes are applied without a manual <span className="font-bold text-graphite">Apply</span>.</p>
                <p>No content is published without a manual <span className="font-bold text-graphite">Publish</span>.</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Recent SEO Changes</p>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    <th className="px-3 py-3">Action</th>
                    <th className="px-3 py-3">Resource</th>
                    <th className="px-3 py-3">Resource ID</th>
                    <th className="px-3 py-3">Operator</th>
                    <th className="px-3 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentChanges.map((item) => (
                    <tr key={item.id} className="border-b border-graphite/5">
                      <td className="px-3 py-4 font-bold text-graphite">{item.action}</td>
                      <td className="px-3 py-4 text-muted">{item.resourceType}</td>
                      <td className="px-3 py-4 text-muted">{item.resourceId ?? "-"}</td>
                      <td className="px-3 py-4 text-muted">{item.operatorId ?? "-"}</td>
                      <td className="px-3 py-4 text-muted">{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-3xl bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl font-black text-graphite">{value}</p>
      <p className="mt-3 text-sm text-muted">{note}</p>
    </div>
  );
}

function ConnectionCard({ title, status }: { title: string; status: "Connected" | "Not Connected" }) {
  return (
    <div className="rounded-2xl bg-warm p-4">
      <p className="text-sm font-bold text-graphite">{title}</p>
      <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${status === "Connected" ? "bg-lime text-graphite" : "bg-graphite text-white"}`}>
        {status}
      </p>
    </div>
  );
}
