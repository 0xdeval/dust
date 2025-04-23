import type {
  TokenPair,
  SubgraphAppName,
  TokenSellabilityResult,
  SubgraphPool,
  SubgraphResponse,
} from "@/types/subgraph";
import { chunk, getSortedTokenPair } from "../../lib/subgraph/utils";
import { generateSubgraphRequest } from "../../lib/subgraph/utils";
import { executeSubgraphQuery } from "../../lib/subgraph/querying";

export async function checkTokensSellability(
  toSellTokens: Array<string>,
  toRecieveToken: string,
  appName: SubgraphAppName,
  chainId: number
): Promise<TokenSellabilityResult> {
  const stableToken = toRecieveToken.toLowerCase();

  // Filter out the received token from the list of tokens to check
  const tokensToCheck = toSellTokens.filter((token) => token.toLowerCase() !== stableToken);

  const tokenMap = new Map<string, boolean>();
  const allPairs: Array<TokenPair> = [];

  // Initialize token map
  for (const toSellToken of tokensToCheck) {
    const lowerToSellToken = toSellToken.toLowerCase();
    tokenMap.set(lowerToSellToken, false);
    allPairs.push(getSortedTokenPair(lowerToSellToken, stableToken));
  }

  const pairChunks = chunk(allPairs, 10);
  const allPools: Array<SubgraphPool> = [];

  // Run all chunk requests in parallel
  const chunkPromises = pairChunks.map(async (pairChunk) => {
    try {
      const { query, variables, config } = generateSubgraphRequest(appName, chainId, pairChunk);
      const response = await executeSubgraphQuery<SubgraphResponse>(
        chainId,
        query,
        config.subgraphUrl,
        variables
      );
      return response?.pools ?? [];
    } catch (error) {
      console.warn("Subgraph query failed for chunk:", pairChunk, error);
      return [];
    }
  });

  // Wait for all requests to complete
  const results = await Promise.all(chunkPromises);
  allPools.push(...results.flat());

  // Update token map based on found pools
  for (const pool of allPools) {
    const token0 = pool.token0.id.toLowerCase();
    const token1 = pool.token1.id.toLowerCase();
    const dynamicToken = [token0, token1].find((t) => t !== stableToken);
    if (dynamicToken) {
      tokenMap.set(dynamicToken, true);
    }
  }

  // Prepare result
  const result: TokenSellabilityResult = {
    sellable: [] as Array<string>,
    burnable: [] as Array<string>,
  };

  // Add the received token to sellable list
  result.sellable.push(stableToken);

  // Categorize other tokens
  for (const [token, isSellable] of tokenMap.entries()) {
    if (isSellable) {
      result.sellable.push(token);
    } else {
      result.burnable.push(token);
    }
  }

  return result;
}
