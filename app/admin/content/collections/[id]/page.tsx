"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminCollectionLandingEditor } from "@/components/admin/admin-collection-landing-editor";
import { getAdminCollectionLanding } from "@/lib/admin-api";
import type { AdminCollectionLanding } from "@/lib/admin-content-types";

export default function AdminCollectionLandingDetailRoute() {
  const params = useParams<{ id: string }>();
  const pageId = typeof params.id === "string" ? params.id : "";
  const [page, setPage] = useState<AdminCollectionLanding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId) return;
    let active = true;
    getAdminCollectionLanding(pageId)
      .then((data) => {
        if (!active) return;
        setPage(data);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load collection landing");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [pageId]);

  if (!pageId) return <p className="text-sm font-bold text-red-700">Collection landing id is missing.</p>;
  if (loading) return <p className="text-sm text-muted">Loading collection landing...</p>;
  if (error) return <p className="text-sm font-bold text-red-700">{error}</p>;
  if (!page) return <p className="text-sm font-bold text-red-700">Collection landing not found.</p>;

  return <AdminCollectionLandingEditor page={page} />;
}
