import type { ReactNode } from "react";
import { AdminPageHeader } from "./admin-page-header";
import { AdminProductResearchNav } from "./admin-product-research-nav";

export function AdminProductResearchSectionShell({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={eyebrow} title={title} body={body} />
      <AdminProductResearchNav />
      {children}
    </div>
  );
}
