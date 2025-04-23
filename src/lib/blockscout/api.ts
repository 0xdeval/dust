import type { Token } from "@/types/tokens";
import type { SupportedChain } from "@/types/networks";
import { formatBalance } from "./utils";

interface BlockscoutResponse {
  items: Array<BlockscoutTokenItem>;
}

interface BlockscoutTokenItem {
  token: {
    address: string;
    circulating_market_cap: string | null;
    decimals: string;
    exchange_rate: string | null;
    holders: string;
    icon_url: string | null;
    name: string;
    symbol: string;
    total_supply: string;
    type: string;
    volume_24h: string | null;
  };
  token_id: string | null;
  token_instance: unknown | null;
  value: string;
}

export async function fetchTokens(address: string, network: SupportedChain): Promise<Array<Token>> {
  try {
    const response = await fetch(
      `${network.apiUrl || network.explorerUrl}/api/v2/addresses/${address}/tokens`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: BlockscoutResponse = await response.json();

    // TODO: Add pagination fetching
    return data.items
      .filter((item) => {
        const value = BigInt(item.value || "0");
        return item.token.type === "ERC-20" && value > BigInt(0);
      })
      .map((item) => {
        const decimals = Number.parseInt(item.token.decimals || "18", 10);
        let rawBalance: bigint;
        try {
          rawBalance = BigInt(item.value);
        } catch {
          rawBalance = BigInt(0);
        }

        // console.log("rawBalance", rawBalance);

        const formattedBalance = formatBalance(rawBalance, decimals);
        // console.log("formattedBalance", formattedBalance);

        let price = 0;
        if (item.token.exchange_rate) {
          const parsedPrice = Number.parseFloat(item.token.exchange_rate);
          if (!Number.isNaN(parsedPrice)) {
            price = parsedPrice;
          }
        }

        return {
          address: item.token.address as `0x${string}`,
          symbol: item.token.symbol,
          name: item.token.name,
          decimals,
          balance: formattedBalance.toFixed(4),
          rawBalance,
          logoURI: item.token.icon_url,
          price,
        };
      });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}
