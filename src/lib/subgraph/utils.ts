import type {
  BuildQueryFn,
  SubgraphAppName,
  SubgraphConfig,
  SubgraphMap,
  TokenPair,
} from "@/types/subgraph";
import { UNISWAP_SUBGRAPH_CONFIGS } from "./configs/uniswap";
import { buildUniswapV3Query } from "./queries/uniswap";

export const subgraphsMap: SubgraphMap = {
  uniswap: {
    config: UNISWAP_SUBGRAPH_CONFIGS,
    queryBuilder: buildUniswapV3Query,
  },
};

export function chunk<T>(array: Array<T>, size: number): Array<Array<T>> {
  const result: Array<Array<T>> = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export const getSubgraphConfig = (
  appName: SubgraphAppName,
  chainId: number
): SubgraphConfig | undefined => {
  const appConfig = subgraphsMap[appName];
  if (!appConfig) throw new Error(`Subgraph config for ${appName} not found`);
  return appConfig.config[chainId];
};

export const getQueryBuilder = (appName: SubgraphAppName): BuildQueryFn => {
  const appConfig = subgraphsMap[appName];
  if (!appConfig || !appConfig.queryBuilder) {
    throw new Error(`Query builder for ${appName} not found`);
  }
  return appConfig.queryBuilder;
};

export const generateSubgraphRequest = (
  appName: SubgraphAppName,
  chainId: number,
  tokens: Array<TokenPair>
) => {
  const queryBuilder = getQueryBuilder(appName);
  const queryData = queryBuilder(tokens);
  const config = getSubgraphConfig(appName, chainId);

  if (!queryData || !config) {
    throw new Error(`Subgraph request for ${appName} not found`);
  }

  return {
    query: queryData.query,
    variables: queryData.variables,
    config,
  };
};

export function getSortedTokenPair(tokenA: string, tokenB: string): TokenPair {
  const [token0, token1] = [tokenA.toLowerCase(), tokenB.toLowerCase()].sort((a, b) =>
    a.localeCompare(b)
  );
  return { token0: token0.toLowerCase(), token1: token1.toLowerCase() };
}
