import { describe, it, expect } from "vitest";
import { buildQuoteRequest, buildExecuteRequest } from "./buildBody";
import type { OdosInputToken, OdosOutputToken } from "@/types/api/odos";

describe("buildQuoteRequest", () => {
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
      referralCode: 0,
    });
  });

  it("builds quote request with custom chain ID and slippage", () => {
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
      referralCode: 0,
    });
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
});

describe("buildExecuteRequest", () => {
  const mockUserAddress = "0x1234567890123456789012345678901234567890" as `0x${string}`;
  const mockPathId = "test-path-id";

  it("builds execute request without simulation", () => {
    const result = buildExecuteRequest({
      pathId: mockPathId,
      userAddress: mockUserAddress,
    });

    expect(result).toEqual({
      userAddr: mockUserAddress,
      pathId: mockPathId,
      simulate: undefined,
    });
  });

  it("builds execute request with simulation enabled", () => {
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

  it("builds execute request with simulation disabled", () => {
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
});
