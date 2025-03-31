import type { Token } from "@/lib/types/tokens";

const BLOCKSCOUT_API_URL = "https://eth-sepolia.blockscout.com/api/v2";

// Define the API response type to match Blockscout's structure
interface BlockscoutResponse {
  items: BlockscoutTokenItem[];
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

export async function fetchTokens(address: string): Promise<Token[]> {
  try {
    const response = await fetch(
      `${BLOCKSCOUT_API_URL}/addresses/${address}/tokens`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: BlockscoutResponse = await response.json();

    // Transform the API response to our Token type
    return data.items
      .filter((item) => {
        // Filter for valid ERC-20 tokens with positive balance
        const value = BigInt(item.value || "0");
        return item.token.type === "ERC-20" && value > BigInt(0);
      })
      .map((item) => {
        // Safe number parsing with fallbacks
        const decimals = Number.parseInt(item.token.decimals || "18", 10);
        let rawBalance: bigint;
        try {
          rawBalance = BigInt(item.value);
        } catch {
          rawBalance = BigInt(0);
        }

        console.log("rawBalance", rawBalance);

        const formattedBalance = formatBalance(rawBalance, decimals);
        console.log("formattedBalance", formattedBalance);

        // Parse exchange rate if available
        let price = 0;
        if (item.token.exchange_rate) {
          const parsedPrice = Number.parseFloat(item.token.exchange_rate);
          if (!Number.isNaN(parsedPrice)) {
            price = parsedPrice;
          }
        }

        return {
          address: item.token.address,
          symbol: item.token.symbol,
          name: item.token.name,
          decimals,
          balance: formattedBalance,
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

function formatBalance(value: bigint, decimals: number): string {
  // Input validation
  if (decimals < 0 || decimals > 30) {
    throw new Error("Invalid decimals value: must be between 0 and 30");
  }
  if (value < BigInt(0)) {
    throw new Error("Invalid value: must be non-negative");
  }

  // Early returns
  if (decimals === 0 || value === BigInt(0)) {
    return value.toString();
  }

  try {
    // Calculate divisor safely
    let divisor = BigInt(1);
    for (let i = 0; i < decimals; i++) {
      divisor *= BigInt(10);
    }

    const integerPart = value / divisor;
    const fractionalPart = value % divisor;

    // Handle fractional part with proper padding
    let fractionalStr = fractionalPart.toString();
    // Pad with leading zeros if necessary
    fractionalStr = fractionalStr.padStart(decimals, "0");
    // Trim trailing zeros
    fractionalStr = fractionalStr.replace(/0+$/, "");

    if (fractionalStr === "") {
      return integerPart.toString();
    }

    return `${integerPart}.${fractionalStr}`;
  } catch (error) {
    console.error("Error formatting balance:", error);
    return "0";
  }
}
