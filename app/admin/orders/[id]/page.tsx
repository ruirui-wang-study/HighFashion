"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminOrderDetailPageClient } from "@/components/admin/admin-order-detail-page";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useLocale } from "@/components/locale-provider";
import { getAdminOrder } from "@/lib/admin-api";
import type { AdminOrderDetail } from "@/lib/admin-orders-types";

export default function AdminOrderDetailRoute() {
  const { messages } = useLocale();
  const orderMessages = messages.admin.orderDetail;
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
        setError(nextError instanceof Error ? nextError.message : orderMessages.loadFailed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId, orderMessages.loadFailed]);

  if (!orderId) {
    return <p className="text-sm font-bold text-red-700">{orderMessages.missingId}</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted">{orderMessages.loading}</p>;
  }

  if (error) {
    return <p className="text-sm font-bold text-red-700">{error}</p>;
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow={orderMessages.eyebrow}
          title={orderMessages.notFoundTitle}
          body={orderMessages.notFoundBody}
        />
      </div>
    );
  }

  return <AdminOrderDetailPageClient initialOrder={order} />;
}
