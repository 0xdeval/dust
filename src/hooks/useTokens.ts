import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { fetchTokens } from "@/lib/blockscout/api";
import type { Token } from "@/types/tokens";
import { useAppStateContext } from "@/context/AppStateContext";
import { TOKENS_FETCHING_CACHE_DURATION } from "@/utils/constants";
import { useLogger } from "./useLogger";

interface CacheEntry {
  tokens: Array<Token>;
  timestamp: number;
}

export function useTokens() {
  const logger = useLogger("useTokens.ts");

  const { address } = useAccount();
  const { selectedNetwork } = useAppStateContext();
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  useEffect(() => {
    async function fetchUserTokens() {
      if (!address || !selectedNetwork) {
        setTokens([]);
        setIsLoading(false);
        return;
      }

      const cacheKey = `${selectedNetwork.id}-${address}`;
      const cachedData = cacheRef.current.get(cacheKey);

      if (cachedData && Date.now() - cachedData.timestamp < TOKENS_FETCHING_CACHE_DURATION) {
        setTokens(cachedData.tokens);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetchedTokens = await fetchTokens(address as string, selectedNetwork);
        logger.info("Number of fetched tokens:", { fetchedTokensAmount: fetchedTokens.length });
        setTokens(fetchedTokens);
        cacheRef.current.set(cacheKey, {
          tokens: fetchedTokens,
          timestamp: Date.now(),
        });
      } catch (error) {
        logger.error("Error fetching tokens:", error);
        setError(error instanceof Error ? error : new Error("Failed to fetch tokens"));
        setTokens([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserTokens();
  }, [address, selectedNetwork, logger]);

  return { tokens, isLoading, error };
}
