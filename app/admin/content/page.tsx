"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useLocale } from "@/components/locale-provider";

export default function AdminContentIndexPage() {
  const { messages } = useLocale();
  const contentIndex = messages.admin.contentIndex;
  const sections = [
    {
      title: contentIndex.sections.guides.title,
      body: contentIndex.sections.guides.body,
      href: "/admin/content/guides",
    },
    {
      title: contentIndex.sections.faq.title,
      body: contentIndex.sections.faq.body,
      href: "/admin/content/faq",
    },
    {
      title: contentIndex.sections.collections.title,
      body: contentIndex.sections.collections.body,
      href: "/admin/content/collections",
    },
    {
      title: contentIndex.sections.staticPages.title,
      body: contentIndex.sections.staticPages.body,
      href: "/admin/content/static-pages",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={contentIndex.eyebrow}
        title={contentIndex.title}
        body={contentIndex.body}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-3xl bg-white p-6 shadow-utility">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{section.title}</p>
            <p className="mt-4 text-sm leading-6 text-muted">{section.body}</p>
            <div className="mt-6">
              <Button asChild variant="ghost">
                <Link href={section.href}>{contentIndex.open}</Link>
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
