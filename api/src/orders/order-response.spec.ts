import { normalizeOrderResponse } from "./order-response";

describe("normalizeOrderResponse", () => {
  it("returns a storefront-safe order payload with customer and shipping details", () => {
    const input = {
      id: "order_123",
      orderNo: "PG123",
      email: "runner@example.com",
      status: "PAID",
      createdAt: new Date("2026-05-22T00:00:00.000Z"),
      paymentStatus: "PAID",
      fulfillmentStatus: "UNFULFILLED",
      fulfilledAt: null,
      currency: "usd",
      subtotalCents: 3400,
      shippingCents: 699,
      discountCents: 0,
      totalCents: 4099,
      stripeCheckoutSessionId: "cs_test_123",
      stripePaymentIntentId: "pi_123",
      paymentMethodType: "card",
      customerCountry: "US",
      shippingAddress: {
        name: "Taylor Runner",
        address: {
          line1: "10 Market St",
          line2: "Apt 4",
          city: "San Francisco",
          state: "CA",
          postal_code: "94105",
          country: "US",
        },
      },
      billingAddress: {
        name: "Taylor Runner",
        email: "runner@example.com",
        phone: "+1 555 123 4567",
        address: {
          line1: "10 Market St",
          line2: null,
          city: "San Francisco",
          state: "CA",
          postal_code: "94105",
          country: "US",
        },
      },
      items: [
        {
          id: "item_123",
          orderId: "order_123",
          productId: "product_123",
          variantId: "variant_123",
          titleSnapshot: "PulseFlex Knee Sleeve",
          skuSnapshot: "PG-PKS-GRA-L",
          colorSnapshot: "Graphite",
          sizeSnapshot: "L",
          quantity: 1,
          unitPriceCents: 3400,
          lineTotalCents: 3400,
        },
      ],
    };
    const response = normalizeOrderResponse(input as unknown as Parameters<typeof normalizeOrderResponse>[0]);

    expect(response).toEqual({
      id: "order_123",
      orderNo: "PG123",
      email: "runner@example.com",
      status: "PAID",
      createdAt: "2026-05-22T00:00:00.000Z",
      paymentStatus: "PAID",
      fulfillmentStatus: "UNFULFILLED",
      fulfilledAt: null,
      currency: "usd",
      subtotalCents: 3400,
      shippingCents: 699,
      discountCents: 0,
      totalCents: 4099,
      stripeCheckoutSessionId: "cs_test_123",
      stripePaymentIntentId: "pi_123",
      paymentMethodType: "card",
      customerCountry: "US",
      shippingAddress: {
        name: "Taylor Runner",
        address: {
          line1: "10 Market St",
          line2: "Apt 4",
          city: "San Francisco",
          state: "CA",
          postal_code: "94105",
          country: "US",
        },
      },
      billingAddress: {
        name: "Taylor Runner",
        email: "runner@example.com",
        phone: "+1 555 123 4567",
        address: {
          line1: "10 Market St",
          line2: null,
          city: "San Francisco",
          state: "CA",
          postal_code: "94105",
          country: "US",
        },
      },
      items: [
        {
          id: "item_123",
          titleSnapshot: "PulseFlex Knee Sleeve",
          skuSnapshot: "PG-PKS-GRA-L",
          colorSnapshot: "Graphite",
          sizeSnapshot: "L",
          quantity: 1,
          unitPriceCents: 3400,
          lineTotalCents: 3400,
        },
      ],
      notes: [],
      statusEvents: [],
    });
  });
});
