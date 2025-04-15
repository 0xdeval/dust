import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  stringToBigInt,
  getCopies,
  getTxnStatusCopies,
  mapTokensWithApprovalStatus,
  getNetworkInfo,
  txnErrorToHumanReadable,
  truncateText,
  networkInfoCache,
} from "./utils";
import type { SelectedToken } from "@/types/tokens";

describe("stringToBigInt", () => {
  it("converts string to BigInt with default decimals", () => {
    expect(stringToBigInt("1.0")).toBe(1000000000000000000n);
    expect(stringToBigInt("0.5")).toBe(500000000000000000n);
  });

  it("converts string to BigInt with custom decimals", () => {
    expect(stringToBigInt("1.0", 6)).toBe(1000000n);
    expect(stringToBigInt("0.5", 6)).toBe(500000n);
  });
});

describe("getCopies", () => {
  it("returns correct copies for CONNECT_WALLET phase", () => {
    expect(getCopies("CONNECT_WALLET")).toEqual({
      contentHeadline: "CONNECT YOUR WALLET",
      contentSubtitle: "Connect your wallet to start trading",
      contentButtonLabel: "Connect Wallet",
    });
  });

  it("returns correct copies for SELL_TOKENS phase", () => {
    expect(getCopies("SELL_TOKENS")).toEqual({
      contentHeadline: "SELLING TOKENS",
      contentSubtitle: "Review and confirm your trade",
      contentButtonLabel: "Confirm Trade",
    });
  });
});

describe("getTxnStatusCopies", () => {
  it("returns error copies when isError is true", () => {
    expect(getTxnStatusCopies(true, { error: "Test error" })).toEqual({
      contentHeadline: "TRADE FAILED",
      contentSubtitle: "Your trade has failed. Error: Test error",
      contentButtonLabel: "Try again",
    });
  });

  it("returns success copies when isError is false", () => {
    expect(getTxnStatusCopies(false, { hash: "0x123" })).toEqual({
      contentHeadline: "TRADE IS COMPLETED",
      contentSubtitle: "Your trade has been successfully executed. Transaction hash: 0x123",
      contentButtonLabel: "Dust again",
    });
  });
});

describe("mapTokensWithApprovalStatus", () => {
  const selectedTokens = [
    {
      address: "0x1",
      symbol: "TOKEN1",
      isSelected: true,
      name: "Token 1",
      decimals: 18,
      balance: "1000",
      price: 1,
      rawBalance: 1000000000000000000000n,
      logoURI: "https://example.com/token1.png",
    },
    {
      address: "0x2",
      symbol: "TOKEN2",
      isSelected: true,
      name: "Token 2",
      decimals: 18,
      balance: "2000",
      price: 2,
      rawBalance: 2000000000000000000000n,
      logoURI: "https://example.com/token2.png",
    },
  ] as Array<SelectedToken>;

  const approvedTokens = [
    {
      address: "0x1",
      symbol: "TOKEN1",
      isSelected: true,
      name: "Token 1",
      decimals: 18,
      balance: "1000",
      price: 1,
      rawBalance: 1000000000000000000000n,
      logoURI: "https://example.com/token1.png",
    },
  ] as Array<SelectedToken>;

  it("correctly maps approval status", () => {
    const result = mapTokensWithApprovalStatus(selectedTokens, approvedTokens);
    expect(result).toEqual([
      {
        ...selectedTokens[0],
        isApproving: false,
        isApproved: true,
      },
      {
        ...selectedTokens[1],
        isApproving: true,
        isApproved: false,
      },
    ]);
  });
});

describe("getNetworkInfo", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
    Object.keys(networkInfoCache).forEach((key) => {
      delete networkInfoCache[Number(key)];
    });
  });

  it("fetches and returns network info", async () => {
    const mockData = {
      name: "Test Network",
      logo: "test.png",
      explorers: [{ url: "https://test.explorer" }],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await getNetworkInfo(1);

    expect(mockFetch).toHaveBeenCalledWith("/api/chains/1");
    expect(result).toEqual(mockData);
  });

  it("uses cached data on subsequent calls", async () => {
    const mockData = {
      name: "Test Network",
      logo: "test.png",
      explorers: [{ url: "https://test.explorer" }],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const firstResult = await getNetworkInfo(1);
    const secondResult = await getNetworkInfo(1);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(secondResult).toEqual(firstResult);
  });

  it("returns null on failed request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
    });

    const result = await getNetworkInfo(999);
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await getNetworkInfo(999);

    expect(result).toBeNull();
  });
});

describe("txnErrorToHumanReadable", () => {
  it("returns user rejection message", () => {
    expect(txnErrorToHumanReadable("User rejected the request")).toBe(
      "User rejected the request in his wallet. Try again"
    );
  });

  it("returns original error if not user rejection", () => {
    expect(txnErrorToHumanReadable("Other error")).toBe("Other error");
  });
});

describe("truncateText", () => {
  it("truncates text longer than limit", () => {
    expect(truncateText("This is a very long text", 10)).toBe("This is a ...");
  });

  it("does not truncate text shorter than limit", () => {
    expect(truncateText("Short", 10)).toBe("Short");
  });

  it("uses default limit if not specified", () => {
    const longText = "This is a very long text that should be truncated";
    expect(truncateText(longText)).toBe("This is a very long ...");
  });
});
