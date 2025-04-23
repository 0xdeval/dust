import type { GraphQLResponse } from "@/types/subgraph";
import { INITIAL_RETRY_DELAY, MAX_RETRIES, SUBGRAPH_BASE_URL } from "@/utils/constants";
import dotenv from "dotenv";

dotenv.config();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeSubgraphQuery<T>(
  chainId: number,
  query: string,
  subgraphUrl: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!subgraphUrl) {
    throw new Error(`No subgraph endpoint found for chain ID: ${chainId}`);
  }

  let lastError: Error | null = null;
  let retryDelay = INITIAL_RETRY_DELAY;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${SUBGRAPH_BASE_URL}/${subgraphUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as GraphQLResponse<T>;

      if (result.errors) {
        // Check if it's an indexer error
        const isIndexerError = result.errors.some(
          (error) =>
            error.message.toLowerCase().includes("indexer") ||
            error.message.toLowerCase().includes("timeout")
        );

        if (isIndexerError && attempt < MAX_RETRIES - 1) {
          throw new Error("Indexer error, will retry");
        }

        console.error("GraphQL Errors:", result.errors);
        throw new Error(`GraphQL Error: ${result.errors[0].message}`);
      }

      return result.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's not the last attempt, wait and retry
      if (attempt < MAX_RETRIES - 1) {
        await sleep(retryDelay);
        retryDelay *= 2; // Exponential backoff
        continue;
      }
    }
  }

  throw lastError || new Error("Failed to execute subgraph query after retries");
}

// Example usage:
/*
const query = `
  query GetTokens($first: Int!) {
    tokens(first: $first) {
      id
      symbol
      name
    }
  }
`;

const result = await executeSubgraphQuery<{ tokens: Array<{ id: string; symbol: string; name: string }> }>(
  8453, // chainId
  query,
  { first: 10 }
);
*/
