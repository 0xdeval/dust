import { describe, it, expect } from "vitest";
import { formatBalance } from "./utils";

describe("formatBalance", () => {
  it("formats whole numbers correctly", () => {
    expect(formatBalance(BigInt(1000), 0)).toBe(1000);
    expect(formatBalance(BigInt(0), 0)).toBe(0);
  });

  it("formats decimal numbers correctly", () => {
    // 1.5 tokens (with 18 decimals)
    expect(formatBalance(BigInt("1500000000000000000"), 18)).toBe(1.5);
    // 0.1 tokens (with 18 decimals)
    expect(formatBalance(BigInt("100000000000000000"), 18)).toBe(0.1);
    // 1.23456 tokens (with 18 decimals) - should round to 4 decimals
    expect(formatBalance(BigInt("1234560000000000000"), 18)).toBe(1.23456);
  });

  it("handles zero value correctly", () => {
    expect(formatBalance(BigInt(0), 18)).toBe(0);
    expect(formatBalance(BigInt(0), 6)).toBe(0);
  });

  it("handles small decimal values correctly", () => {
    // 0.000000001 tokens (with 18 decimals)
    expect(formatBalance(BigInt("1000000000"), 18)).toBe(1e-9);
    // Very small number should show as 0.0000
    expect(formatBalance(BigInt("1"), 18)).toBe(1e-18);
  });

  it("handles different decimal places correctly", () => {
    // 1.5 tokens with 6 decimals (like USDC)
    expect(formatBalance(BigInt("1500000"), 6)).toBe(1.5);
    // 1.5 tokens with 8 decimals (like WBTC)
    expect(formatBalance(BigInt("150000000"), 8)).toBe(1.5);
  });

  it("throws error for negative decimals", () => {
    expect(() => formatBalance(BigInt(1000), -1)).toThrow(
      "Invalid decimals value: must be between 0 and 30"
    );
  });

  it("throws error for decimals > 30", () => {
    expect(() => formatBalance(BigInt(1000), 31)).toThrow(
      "Invalid decimals value: must be between 0 and 30"
    );
  });

  it("throws error for negative values", () => {
    expect(() => formatBalance(BigInt(-1000), 18)).toThrow("Invalid value: must be non-negative");
  });

  it("handles large numbers correctly", () => {
    // 1000000 tokens (with 18 decimals)
    expect(formatBalance(BigInt("1000000000000000000000000"), 18)).toBe(1000000);
  });
});
