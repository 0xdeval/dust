import { executeSubgraphQuery } from "@/lib/subgraph/querying";

// Request queue to prevent duplicate requests
const requestQueue = new Map<string, Promise<unknown>>();

export async function executeCachedQuery<T>(
  chainId: number,
  query: string,
  subgraphUrl: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const cacheKey = `${chainId}-${subgraphUrl}-${JSON.stringify(variables)}`;

  // Check if there's already a request in progress
  if (requestQueue.has(cacheKey)) {
    return requestQueue.get(cacheKey) as Promise<T>;
  }

  const requestPromise = executeSubgraphQuery<T>(chainId, query, subgraphUrl, variables);
  requestQueue.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    requestQueue.delete(cacheKey);
  }
}
