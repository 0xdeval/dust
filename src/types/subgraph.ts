export interface SubgraphConfig {
  name: string;
  subgraphUrl: string;
}

export type SubgraphAppName = "uniswap" | "sushi";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations: Array<{ line: number; column: number }>;
    path: Array<string | number>;
  }>;
}

export type BuildQueryFn = (tokens: Array<TokenPair>) => {
  query: string;
  variables: Record<string, string>;
};

export interface SubgraphMap {
  [key: string]: {
    config: Record<string, SubgraphConfig>;
    queryBuilder: BuildQueryFn;
  };
}

export type TokenPair = { token0: string; token1: string };

export interface TokenSellabilityResult {
  sellable: Array<string>;
  burnable: Array<string>;
}

export interface SubgraphPool {
  id: string;
  token0: {
    id: string;
  };
  token1: {
    id: string;
  };
}

export interface SubgraphResponse {
  pools: Array<SubgraphPool>;
}
