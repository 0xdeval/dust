import { describe, it, expect } from "vitest";
import { fetchTokens } from "@/lib/blockscout/api";

describe("Blockscout API Integration", () => {
  const testAddress = "0x813399e5b08Bb50b038AA7dF6347b6AF2D161828";
  const testNetwork = {
    id: 1,
    name: "Ethereum",
    apiUrl: "https://blockscout.com/eth/mainnet",
    explorerUrl: "https://blockscout.com/eth/mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://eth.llamarpc.com"] },
      public: { http: ["https://eth.llamarpc.com"] },
    },
  };

  it("successfully connects to Blockscout API", async () => {
    const result = await fetchTokens(testAddress, testNetwork);

    expect(Array.isArray(result)).toBe(true);

    if (result.length > 0) {
      expect(result[0]).toHaveProperty("address");
      expect(result[0]).toHaveProperty("symbol");
      expect(result[0]).toHaveProperty("decimals");
      expect(result[0]).toHaveProperty("balance");
    }
  }, 10000);
});
