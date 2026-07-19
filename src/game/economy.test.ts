import { describe, expect, it } from "vitest";
import { roundCurrency } from "./economy";

describe("currency precision", () => {
  it("rounds ordinary balances to cents", () => {
    expect(roundCurrency(12.345)).toBe(12.35);
  });

  it("does not introduce extra rounding errors on quadrillion-scale balances", () => {
    const balance = 2_000_000_000_000_000;
    const representableResult = balance - 6.25;

    expect(roundCurrency(representableResult)).toBe(representableResult);
    expect(balance - roundCurrency(representableResult)).toBe(6.25);
  });
});
