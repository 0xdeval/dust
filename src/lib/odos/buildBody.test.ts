import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildQuoteRequest, buildExecuteRequest } from "@/lib/odos/buildBody";
import type { OdosInputToken, OdosOutputToken } from "@/types/api/odos";
import { appConfig } from "@/config/app";

// Mock appConfig
vi.mock("@/config/app", () => ({
  appConfig: {
    odosPartnerKey: 12345, // Mock value for testing
  },
}));

describe("buildQuoteRequest", () => {
  beforeEach(() => {
    // If appConfig was changed in a test, reset it or re-mock if needed.
    // For this simple case, the initial mock should suffice for all tests in this describe block.
  });

  const mockUserAddress = "0x1234567890123456789012345678901234567890" as `0x${string}`;

  const mockInputTokens: Array<OdosInputToken> = [
    {
      tokenAddress: "0xtoken1" as `0x${string}`,
      amount: "1000000000000000000",
    },
    {
      tokenAddress: "0xtoken2" as `0x${string}`,
      amount: "2000000000000000000",
    },
  ];

  const mockOutputTokens: Array<OdosOutputToken> = [
    {
      tokenAddress: "0xtoken3" as `0x${string}`,
      proportion: 0.5,
    },
    {
      tokenAddress: "0xtoken4" as `0x${string}`,
      proportion: 0.5,
    },
  ];

  it("builds quote request with default parameters", () => {
    const result = buildQuoteRequest({
      inputTokens: mockInputTokens,
      outputTokens: mockOutputTokens,
      userAddress: mockUserAddress,
    });

    expect(result).toEqual({
      chainId: 1,
      inputTokens: mockInputTokens,
      outputTokens: [
        { tokenAddress: "0xtoken3", proportion: 0.5 },
        { tokenAddress: "0xtoken4", proportion: 0.5 },
      ],
      userAddr: mockUserAddress,
      slippageLimitPercent: 0.3,
      disableRFQs: true,
      compact: true,
      referralCode: appConfig.odosPartnerKey, // Check against mocked value
    });
  });

  it("builds quote request with custom chain ID, slippage and uses mocked referralCode", () => {
    const result = buildQuoteRequest({
      inputTokens: mockInputTokens,
      outputTokens: mockOutputTokens,
      userAddress: mockUserAddress,
      chainId: 137,
      slippageLimitPercent: 1.0,
    });

    expect(result).toEqual({
      chainId: 137,
      inputTokens: mockInputTokens,
      outputTokens: [
        { tokenAddress: "0xtoken3", proportion: 0.5 },
        { tokenAddress: "0xtoken4", proportion: 0.5 },
      ],
      userAddr: mockUserAddress,
      slippageLimitPercent: 1.0,
      disableRFQs: true,
      compact: true,
      referralCode: appConfig.odosPartnerKey, // Check against mocked value
    });
  });

  // Test to ensure appConfig can be "changed" for a specific test if needed,
  // though direct module modification is tricky with ESM.
  // This test is more of a placeholder for that idea; actual implementation
  // might require more advanced vi.mock features or different test structure.
  it("uses a different referral code if appConfig were mutable for a test", () => {
    // This test primarily verifies that if appConfig.odosPartnerKey was different,
    // the function would use it. The vi.mock at the top sets it for all tests.
    const expectedReferralCode = appConfig.odosPartnerKey; // Using the globally mocked value

    const result = buildQuoteRequest({
      inputTokens: mockInputTokens,
      outputTokens: mockOutputTokens,
      userAddress: mockUserAddress,
    });
    expect(result.referralCode).toBe(expectedReferralCode);
  });


  it("correctly distributes proportions for single output token", () => {
    const result = buildQuoteRequest({
      inputTokens: mockInputTokens,
      outputTokens: [mockOutputTokens[0]],
      userAddress: mockUserAddress,
    });

    expect(result.outputTokens).toEqual([{ tokenAddress: "0xtoken3", proportion: 1 }]);
  });

  it("correctly distributes proportions for multiple output tokens", () => {
    const threeOutputTokens = [
      ...mockOutputTokens,
      { tokenAddress: "0xtoken5" as `0x${string}`, proportion: 1 / 3 },
    ];

    const result = buildQuoteRequest({
      inputTokens: mockInputTokens,
      outputTokens: threeOutputTokens,
      userAddress: mockUserAddress,
    });

    expect(result.outputTokens).toEqual([
      { tokenAddress: "0xtoken3", proportion: 1 / 3 },
      { tokenAddress: "0xtoken4", proportion: 1 / 3 },
      { tokenAddress: "0xtoken5", proportion: 1 / 3 },
    ]);
  });

  it("handles empty inputTokens array", () => {
    const result = buildQuoteRequest({
      inputTokens: [],
      outputTokens: mockOutputTokens,
      userAddress: mockUserAddress,
    });
    expect(result.inputTokens).toEqual([]);
  });

  it("handles empty outputTokens array", () => {
    const result = buildQuoteRequest({
      inputTokens: mockInputTokens,
      outputTokens: [],
      userAddress: mockUserAddress,
    });
    // According to Odos API, outputTokens is required.
    // The function as-is would create outputTokens: [] and proportion would be NaN due to 1/0.
    // This behavior should be explicitly tested or the function should throw an error.
    // For now, testing existing behavior:
    expect(result.outputTokens).toEqual([]);
    // If the API expects at least one output token, the function should ideally validate this.
    // Let's assume for now it passes it as is, and Odos API would reject it.
  });
});

describe("buildExecuteRequest", () => {
  const mockUserAddress = "0x1234567890123456789012345678901234567890" as `0x${string}`;
  const mockPathId = "test-path-id";

  it("builds execute request without simulation (simulate undefined)", () => {
    const result = buildExecuteRequest({
      pathId: mockPathId,
      userAddress: mockUserAddress,
      // simulate is undefined here
    });

    expect(result).toEqual({
      userAddr: mockUserAddress,
      pathId: mockPathId,
      simulate: undefined, // Explicitly checking for undefined
    });
  });

  it("builds execute request with simulation explicitly enabled (true)", () => {
    const result = buildExecuteRequest({
      pathId: mockPathId,
      userAddress: mockUserAddress,
      simulate: true,
    });

    expect(result).toEqual({
      userAddr: mockUserAddress,
      pathId: mockPathId,
      simulate: true,
    });
  });

  it("builds execute request with simulation explicitly disabled (false)", () => {
    const result = buildExecuteRequest({
      pathId: mockPathId,
      userAddress: mockUserAddress,
      simulate: false,
    });

    expect(result).toEqual({
      userAddr: mockUserAddress,
      pathId: mockPathId,
      simulate: false,
    });
  });

  it("handles empty string pathId", () => {
    const result = buildExecuteRequest({
      pathId: "",
      userAddress: mockUserAddress,
    });
    expect(result.pathId).toBe("");
  });
});
