import { calculateShippingCents } from "./shipping";

describe("calculateShippingCents", () => {
  it("returns standard shipping below free shipping threshold", () => {
    expect(calculateShippingCents(5999)).toBe(699);
  });

  it("returns free shipping at threshold", () => {
    expect(calculateShippingCents(6000)).toBe(0);
  });
});
