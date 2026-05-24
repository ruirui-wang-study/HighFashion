"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminGuideEditor } from "@/components/admin/admin-guide-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminGuide } from "@/lib/admin-api";
import type { AdminGuide } from "@/lib/admin-content-types";

export default function AdminGuideDetailRoute() {
  const params = useParams<{ id: string }>();
  const guideId = typeof params.id === "string" ? params.id : "";
  const [guide, setGuide] = useState<AdminGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guideId) {
      return;
    }

    let active = true;
    getAdminGuide(guideId)
      .then((data) => {
        if (!active) return;
        setGuide(data);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load guide");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [guideId]);

  if (!guideId) {
    return <p className="text-sm font-bold text-red-700">Guide id is missing.</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading guide...</p>;
  }

  if (error) {
    return <p className="text-sm font-bold text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title={guide?.title ?? "Guide"}
        body="Edit guide content, SEO metadata, relationships, and publishing state."
      />
      <AdminGuideEditor key={guide?.id ?? "guide-editor"} guide={guide} />
    </div>
  );
}
