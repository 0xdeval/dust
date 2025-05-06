import type { Token } from "@/types/tokens";
import type { SupportedChain } from "@/types/networks";
import { formatBalance } from "@/lib/blockscout/utils";
import type { BlockscoutResponse } from "@/types/api/blockscout";
import { appConfig } from "@/configs/app";
import { TOKENS_MOCK } from "@/utils/mocks/tokens";

export async function fetchTokens(address: string, network: SupportedChain): Promise<Array<Token>> {
  try {
    let data: BlockscoutResponse;
    if (!appConfig.useMocks) {
      const response = await fetch(
        `${network.apiUrl || network.explorerUrl}/api/v2/addresses/${address}/tokens`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      data = await response.json();
    } else {
      data = TOKENS_MOCK;
    }

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

        const formattedBalance = formatBalance(rawBalance, decimals);

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
