import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { StripePaymentProvider } from "./stripe-payment.provider";

const createSession = jest.fn();

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: createSession,
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    paymentIntents: {
      retrieve: jest.fn(),
    },
  }));
});

describe("StripePaymentProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createSession.mockResolvedValue({ id: "cs_test_123", url: "https://checkout.stripe.test/session" });
  });

  it("creates Checkout Sessions without unsupported dynamic payment method params", async () => {
    const config = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          STRIPE_SECRET_KEY: "sk_test_configured",
          ENABLE_STRIPE_AUTOMATIC_PAYMENT_METHODS: "true",
        };
        return values[key];
      }),
    } as unknown as ConfigService;
    const provider = new StripePaymentProvider(config);

    await provider.createCheckoutSession({
      orderId: "order_123",
      orderNo: "PG123",
      email: "test@example.com",
      currency: "usd",
      shippingAmount: 699,
      lineItems: [{ name: "PulseFlex Knee Sleeve", description: "Graphite / L", unitAmount: 3400, quantity: 1 }],
      successUrl: "http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "http://localhost:3000/cart",
    });

    expect(Stripe).toHaveBeenCalledWith("sk_test_configured");
    expect(createSession).toHaveBeenCalledTimes(1);
    const params = createSession.mock.calls[0][0];
    expect(params).not.toHaveProperty("automatic_payment_methods");
    expect(params).not.toHaveProperty("payment_method_types");
  });
});
