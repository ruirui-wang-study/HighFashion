import type { FulfillmentStatus, PaymentStatus } from "@prisma/client";

export type AdminActor = {
  adminId: string;
  adminEmail: string;
};

export type AdminOrderListItem = {
  id: string;
  orderNo: string;
  email: string | null;
  status: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  totalCents: number;
  currency: string;
  customerCountry: string | null;
  createdAt: string;
  fulfilledAt: string | null;
};

export type AdminOrderNoteRecord = {
  id: string;
  note: string;
  createdAt: string;
  createdByAdmin: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type AdminOrderStatusEventRecord = {
  id: string;
  type: string;
  fromValue: string | null;
  toValue: string | null;
  details: unknown;
  createdAt: string;
  createdByAdmin: {
    id: string;
    name: string;
    email: string;
  } | null;
};
