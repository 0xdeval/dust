import type {
  TokenPair,
  SubgraphAppName,
  TokenSellabilityResult,
  SubgraphPool,
  SubgraphResponse,
} from "@/types/subgraph";
import { chunk, getSortedTokenPair } from "@/lib/subgraph/utils";
import { generateSubgraphRequest } from "@/lib/subgraph/utils";
import { executeCachedQuery } from "@/lib/subgraph/subgraphQueueCache";
import { appConfig } from "@/configs/app";
import { SELLABILITY_RESPONSE_MOCK } from "@/utils/mocks/subgraph";

export async function checkTokensSellability(
  toSellTokens: Array<string>,
  toRecieveToken: string,
  appName: SubgraphAppName,
  chainId: number,
  onBatchResult?: (pools: Array<SubgraphPool>, chunkTokens: Array<string>) => void
): Promise<TokenSellabilityResult> {
  const stableToken = toRecieveToken.toLowerCase();
  const tokensToCheck = toSellTokens.filter((token) => token.toLowerCase() !== stableToken);
  if (appConfig.useMocks) {
    return SELLABILITY_RESPONSE_MOCK;
  }

  let allPools: Array<SubgraphPool> = [];

  const tokenMap = new Map<string, boolean>();
  const allPairs: Array<TokenPair> = [];
  for (const toSellToken of tokensToCheck) {
    const lowerToSellToken = toSellToken.toLowerCase();
    tokenMap.set(lowerToSellToken, false);
    allPairs.push(getSortedTokenPair(lowerToSellToken, stableToken));
  }
  const pairChunks = chunk(allPairs, 10);
  for (const pairChunk of pairChunks) {
    try {
      const { query, variables, config } = generateSubgraphRequest(appName, chainId, pairChunk);
      const response = await executeCachedQuery<SubgraphResponse>(
        chainId,
        query,
        config.subgraphUrl,
        variables
      );
      const pools = response?.pools ?? [];
      allPools = allPools.concat(pools);
      if (onBatchResult) {
        const chunkTokens = pairChunk.map((pair) =>
          pair.token0 === stableToken ? pair.token1 : pair.token0
        );
        onBatchResult(pools, chunkTokens);
      }
    } catch (error) {
      console.warn("Subgraph query failed for chunk:", pairChunk, error);
      if (onBatchResult) {
        const chunkTokens = pairChunk.map((pair) =>
          pair.token0 === stableToken ? pair.token1 : pair.token0
        );
        onBatchResult([], chunkTokens);
      }
    }
  }

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
  result.sellable.push(stableToken);
  for (const [token, isSellable] of tokenMap.entries()) {
    if (isSellable) {
      result.sellable.push(token);
    } else {
      result.burnable.push(token);
    }
  }
  return result;
}
