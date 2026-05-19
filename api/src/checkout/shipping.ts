export const FREE_SHIPPING_THRESHOLD_CENTS = 6000;
export const STANDARD_SHIPPING_CENTS = 699;

export function calculateShippingCents(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
}
