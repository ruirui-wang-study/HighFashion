import Stripe from "stripe";
import { getCustomerCountryFromSession, getShippingAddressFromSession } from "./stripe-webhook.mapper";

describe("stripe webhook mapper", () => {
  it("reads shipping details from collected_information when shipping_details is absent", () => {
    const session = {
      collected_information: {
        shipping_details: {
          name: "Runner Test",
          address: {
            line1: "10 Market St",
            line2: null,
            city: "San Francisco",
            state: "CA",
            postal_code: "94105",
            country: "US",
          },
        },
      },
      customer_details: {
        email: "runner@example.com",
        address: {
          line1: "10 Market St",
          city: "San Francisco",
          state: "CA",
          postal_code: "94105",
          country: "US",
        },
      },
    } as unknown as Stripe.Checkout.Session;

    expect(getCustomerCountryFromSession(session)).toBe("US");
    expect(getShippingAddressFromSession(session)).toEqual({
      name: "Runner Test",
      address: {
        line1: "10 Market St",
        line2: null,
        city: "San Francisco",
        state: "CA",
        postal_code: "94105",
        country: "US",
      },
    });
  });
});
