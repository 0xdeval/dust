import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchTokens } from "@/lib/blockscout/api";
import type { SupportedChain } from "@/types/networks";

describe("fetchTokens", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  const mockNetwork: SupportedChain = {
    id: 8453,
    name: "Base",
    explorerUrl: "https://base.blockscout.com",
    apiUrl: "https://base.blockscout.com",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://base.blockscout.com"] },
      public: { http: ["https://base.blockscout.com"] },
    },
  };

  const mockAddress = "0x813399e5b08Bb50b038AA7dF6347b6AF2D161828";

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("successfully fetches and transforms tokens", async () => {
    const mockResponse = {
      items: [
        {
          token: {
            address: "0xtoken1",
            decimals: "18",
            exchange_rate: "1.5",
            icon_url: "https://example.com/token1.png",
            name: "Token 1",
            symbol: "TK1",
            type: "ERC-20",
          },
          value: "1000000000000000000", // 1 token
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchTokens(mockAddress, mockNetwork);

    expect(mockFetch).toHaveBeenCalledWith(
      `${mockNetwork.apiUrl}/api/v2/addresses/${mockAddress}/tokens`
    );

    expect(result).toEqual([
      {
        address: "0xtoken1",
        symbol: "TK1",
        name: "Token 1",
        decimals: 18,
        balance: "1.0000",
        rawBalance: 1000000000000000000n,
        logoURI: "https://example.com/token1.png",
        price: 1.5,
      },
    ]);
  });

  it("filters out non-ERC20, zero balances, missing token object/address, or invalid value for BigInt", async () => {
    const mockResponse = {
      items: [
        // Zero balance
        {
          token: { address: "0xtoken1", decimals: "18", type: "ERC-20", name: "Z", symbol: "Z", exchange_rate: "1", icon_url: "url" },
          value: "0",
        },
        // Non-ERC20
        {
          token: { address: "0xtoken2", decimals: "18", type: "ERC-721", name: "N", symbol: "N", exchange_rate: "1", icon_url: "url" },
          value: "1000000000000000000",
        },
        // Missing token object
        {
          value: "1000000000000000000",
        },
        // Token object is not an object
        {
          token: "not-an-object",
          value: "1000000000000000000",
        },
        // Missing token address
        {
          token: { decimals: "18", type: "ERC-20", name: "M", symbol: "M", exchange_rate: "1", icon_url: "url" },
          value: "1000000000000000000",
        },
         // Invalid value for BigInt conversion
        {
          token: { address: "0xtokenBig3", decimals: "18", type: "ERC-20", name: "B3", symbol: "B3", exchange_rate: "1", icon_url: "url" },
          value: "not-a-valid-bigint-value",
        },
        // Valid token for control
        {
          token: { address: "0xvalidtoken", decimals: "18", type: "ERC-20", name: "V", symbol: "V", exchange_rate: "1", icon_url: "url" },
          value: "1000000000000000000",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchTokens(mockAddress, mockNetwork);
    expect(result).toHaveLength(1);
    expect(result[0].address).toBe("0xvalidtoken");
  });

  it("handles various valid and invalid decimal and exchange_rate values", async () => {
    const mockResponse = {
      items: [
        {
          token: {
            address: "0xtoken1",
            decimals: "18", // valid
            type: "ERC-20",
            name: "Token 1",
            symbol: "TK1",
            icon_url: "icon.png",
            exchange_rate: "1.23", // valid
          },
          value: "1000000000000000000", // 1 token
        },
        {
          token: {
            address: "0xtoken2",
            decimals: "not-a-number", // invalid
            type: "ERC-20",
            name: "Token 2",
            symbol: "TK2",
            icon_url: null, // null icon
            exchange_rate: "not-a-price-string", // invalid
          },
          value: "2000000000000000000", // 2 tokens
        },
        {
          token: {
            address: "0xtoken3",
            decimals: null, // null decimals
            type: "ERC-20",
            name: "Token 3",
            symbol: "TK3",
            icon_url: "icon3.png", // valid icon
            exchange_rate: null, // null rate
          },
          value: "3000000000000000000", // 3 tokens (will use default 18 decimals)
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchTokens(mockAddress, mockNetwork);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      address: "0xtoken1",
      decimals: 18,
      name: "Token 1",
      symbol: "TK1",
      logoURI: "icon.png",
      price: 1.23,
      balance: "1.0000",
      rawBalance: 1000000000000000000n,
    });
    expect(result[1]).toMatchObject({
      address: "0xtoken2",
      decimals: 18, // Defaults to 18
      name: "Token 2",
      symbol: "TK2",
      logoURI: null, // Handles null icon_url
      price: 0, // Defaults to 0 for invalid string
      balance: "2.0000", // Uses default 18 decimals
      rawBalance: 2000000000000000000n,
    });
    expect(result[2]).toMatchObject({
      address: "0xtoken3",
      decimals: 18, // Defaults to 18 for null
      name: "Token 3",
      symbol: "TK3",
      logoURI: "icon3.png",
      price: 0, // Defaults to 0 for null
      balance: "3.0000", // Uses default 18 decimals
      rawBalance: 3000000000000000000n,
    });
  });

  it("handles various BigInt conversions for rawBalance from 'value'", async () => {
    const mockResponse = {
      items: [
        { // Standard valid case
          token: { address: "0xtokenStd", decimals: "18", type: "ERC-20", name: "S", symbol: "S", exchange_rate: "1", icon_url: "url" },
          value: "1000000000000000000", // 1 token
        },
        { // Large number
          token: { address: "0xtokenBig1", decimals: "0", type: "ERC-20", name: "B1", symbol: "B1", exchange_rate: "1", icon_url: "url" },
          value: "123456789012345678901234567890",
        },
        { // Leading zeros
          token: { address: "0xtokenBig2", decimals: "18", type: "ERC-20", name: "B2", symbol: "B2", exchange_rate: "1", icon_url: "url" },
          value: "000001000000000000000000", // 1 token with leading zeros
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    const result = await fetchTokens(mockAddress, mockNetwork);
    expect(result).toHaveLength(3);
    expect(result[0].rawBalance).toEqual(BigInt("1000000000000000000"));
    expect(result[1].rawBalance).toEqual(BigInt("123456789012345678901234567890"));
    expect(result[2].rawBalance).toEqual(BigInt("1000000000000000000")); // 1 with 18 decimals after stripping leading zeros
  });

  it("handles API errors gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    const result = await fetchTokens(mockAddress, mockNetwork);
    expect(result).toEqual([]);
  });

  it("handles network errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchTokens(mockAddress, mockNetwork);
    expect(result).toEqual([]);
  });

  it("uses explorerUrl if apiUrl is not provided", async () => {
    const networkWithoutApi: SupportedChain = {
      ...mockNetwork,
      apiUrl: undefined,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    await fetchTokens(mockAddress, networkWithoutApi);

    expect(mockFetch).toHaveBeenCalledWith(
      `${networkWithoutApi.explorerUrl}/api/v2/addresses/${mockAddress}/tokens`
    );
  });

  it("response contains required token fields", async () => {
    const mockResponse = {
      items: [
        {
          token: {
            address: "0xtoken1",
            decimals: "18",
            exchange_rate: "1.5",
            icon_url: "https://example.com/token1.png",
            name: "Token 1",
            symbol: "TK1",
            type: "ERC-20",
            circulating_market_cap: null,
            holders: "1000",
            total_supply: "1000000",
            volume_24h: null,
          },
          token_id: null,
          token_instance: null,
          value: "1000000000000000000", // 1 token in wei
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchTokens(mockAddress, mockNetwork);

    expect(result[0]).toMatchObject({
      address: expect.stringMatching(/^0x/),
      decimals: expect.any(Number),
      logoURI: expect.any(String),
      name: expect.any(String),
      symbol: expect.any(String),
      balance: expect.any(String),
      price: expect.any(Number),
      rawBalance: expect.any(BigInt),
    });
  });
});
