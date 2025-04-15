import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchTokens } from "./api";
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

  it("filters out non-ERC20 tokens and zero balances", async () => {
    const mockResponse = {
      items: [
        {
          token: {
            address: "0xtoken1",
            decimals: "18",
            type: "ERC-20",
          },
          value: "0",
        },
        {
          token: {
            address: "0xtoken2",
            decimals: "18",
            type: "ERC-721",
          },
          value: "1000000000000000000",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchTokens(mockAddress, mockNetwork);
    expect(result).toEqual([]);
  });

  it("handles invalid decimal values", async () => {
    const mockResponse = {
      items: [
        {
          token: {
            address: "0xtoken1",
            decimals: "18",
            type: "ERC-20",
            name: "Token 1",
            symbol: "TK1",
            icon_url: null,
            exchange_rate: null,
            circulating_market_cap: null,
            holders: "0",
            total_supply: "0",
            volume_24h: null,
          },
          token_id: null,
          token_instance: null,
          value: "1000000000000000000",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchTokens(mockAddress, mockNetwork);

    expect(result[0]).toMatchObject({
      address: "0xtoken1",
      decimals: 18, // default decimals
      name: "Token 1",
      symbol: "TK1",
      logoURI: null,
      price: 0, // default price when exchange_rate is null
      balance: expect.any(String),
      rawBalance: BigInt("1000000000000000000"),
    });
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
    console.log("API Response:", result);

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
