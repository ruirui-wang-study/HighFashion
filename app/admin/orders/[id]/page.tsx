"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminOrderDetailPageClient } from "@/components/admin/admin-order-detail-page";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminOrder } from "@/lib/admin-api";
import type { AdminOrderDetail } from "@/lib/admin-orders-types";

export default function AdminOrderDetailRoute() {
  const params = useParams<{ id: string }>();
  const orderId = typeof params.id === "string" ? params.id : "";
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    let active = true;
    getAdminOrder(orderId)
      .then((data) => {
        if (!active) return;
        setOrder(data);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load order");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (!orderId) {
    return <p className="text-sm font-bold text-red-700">Order id is missing.</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading order...</p>;
  }

  if (error) {
    return <p className="text-sm font-bold text-red-700">{error}</p>;
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Operations"
          title="Order not found"
          body="The requested order could not be loaded from the admin API."
        />
      </div>
    );
  }

  return <AdminOrderDetailPageClient initialOrder={order} />;
}
