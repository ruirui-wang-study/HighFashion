"use client";

import { useEffect, useState } from "react";
import { applySeoInternalLink, generateSeoInternalLinks, getSeoInternalLinks } from "@/lib/admin-api";
import type { InternalLinkSuggestionItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoInternalLinksPageClient() {
  const [items, setItems] = useState<InternalLinkSuggestionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await getSeoInternalLinks());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load internal links");
    }
  }

  useEffect(() => {
    let active = true;
    getSeoInternalLinks()
      .then((nextItems) => {
        if (!active) return;
        setItems(nextItems);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load internal links");
      });
    return () => {
      active = false;
    };
  }, []);

  async function regenerate() {
    await generateSeoInternalLinks();
    await load();
  }

  async function applyItem(id: string) {
    if (!window.confirm("Apply this internal link suggestion to page content?")) return;
    await applySeoInternalLink(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Growth" title="Internal Link Suggestions" body="Review source, target, and anchor text before any internal link change is written." />
      <AdminSeoNav />
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => void regenerate()}>Generate Internal Links</Button>
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Target</th>
              <th className="px-3 py-3">Anchor Text</th>
              <th className="px-3 py-3">Reason</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="px-3 py-4 font-bold text-graphite">{item.sourcePage}</td>
                <td className="px-3 py-4 text-muted">{item.targetPage}</td>
                <td className="px-3 py-4 text-muted">{item.anchorText}</td>
                <td className="px-3 py-4 text-muted">{item.reason}</td>
                <td className="px-3 py-4 text-muted">{item.priority}</td>
                <td className="px-3 py-4 text-muted">{item.status}</td>
                <td className="px-3 py-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => void applyItem(item.id)}>Apply</Button>
                    <Button variant="ghost">Reject</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
