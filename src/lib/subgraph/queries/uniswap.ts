import type { TokenPair } from "@/types/subgraph";

export function buildUniswapV3Query(pairs: Array<TokenPair>) {
  const conditions = pairs
    .map((pair, i) => `{ token0: $token0_${i}, token1: $token1_${i} }`)
    .join(", ");

  const query = `
    query BatchPoolCheck(${pairs
      .map((pair, i) => `$token0_${i}: String!, $token1_${i}: String!`)
      .join(", ")}) {
      pools(where: { or: [${conditions}] }) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `;

  const variables: Record<string, string> = {};
  pairs.forEach(({ token0, token1 }, i) => {
    variables[`token0_${i}`] = token0;
    variables[`token1_${i}`] = token1;
  });

  return { query, variables };
}
