import { useState, useEffect, useRef, useCallback } from "react";
import type { Token } from "@/types/tokens";
import { checkTokensSellability } from "@/utils/actions/checkTokensSellability";
import type { SubgraphAppName, TokenSellabilityResult } from "@/types/subgraph";
import { useAppStateContext } from "@/context/AppStateContext";
import { getCachedResult, setCachedResult } from "@/utils/cache";
import { convertAddressesToTokens } from "@/utils/tokensCheck";
import { useAccount } from "wagmi";
import { getSpamTokens } from "@/utils/actions/checkSpamTokens";
import { useLogger } from "./useLogger";

interface UseTokenChecksResult {
  checkTokens: (appName?: SubgraphAppName) => Promise<void>;
  tokensToBurn: Array<Token>;
  tokensToSell: Array<Token>;
  isPending: boolean;
  error: Error | null;
}

export const useTokensCheck = (tokens: Array<Token>): UseTokenChecksResult => {
  const logger = useLogger("useTokensCheck.ts");

  const [state, setState] = useState({
    isPending: false,
    error: null as Error | null,
    tokensToBurn: [] as Array<Token>,
    tokensToSell: [] as Array<Token>,
  });

  const prevTokensRef = useRef<Array<string>>([]);
  const isCheckingRef = useRef(false);
  const cacheKeyRef = useRef<string>("");

  const { selectedNetwork, receivedToken } = useAppStateContext();
  const { address } = useAccount();

  const checkTokens = useCallback(
    async (appName: SubgraphAppName = "uniswap") => {
      if (!receivedToken || tokens.length === 0) {
        logger.info("No tokens or received token, resetting state");
        setState((prev) => ({ ...prev, isPending: false, tokensToBurn: [], tokensToSell: [] }));
        return;
      }

      if (isCheckingRef.current) {
        logger.info("Already checking tokens, skipping");
        return;
      }

      const currentCacheKey = `${selectedNetwork.id}-${address}-${tokens.length}`;
      if (currentCacheKey === cacheKeyRef.current) {
        logger.info("Already checked tokens, skipping");
        return;
      }

      isCheckingRef.current = true;
      cacheKeyRef.current = currentCacheKey;
      setState((prev) => ({
        ...prev,
        isPending: true,
        error: null,
        tokensToBurn: [],
        tokensToSell: [],
      }));

      try {
        const cachedResult = getCachedResult(selectedNetwork.id, address as string);
        let results: TokenSellabilityResult;

        if (cachedResult) {
          logger.info("Using cached result for a tokens data");
          results = cachedResult;
          setState((prev) => ({
            ...prev,
            tokensToBurn: convertAddressesToTokens(results.burnable, tokens),
            tokensToSell: convertAddressesToTokens(results.sellable, tokens),
            isPending: false,
          }));
        } else {
          const spamTokens = getSpamTokens(tokens);

          const spamAddresses = new Set(spamTokens.map((token) => token.address));
          const tokenAddresses = tokens
            .filter((token) => !spamAddresses.has(token.address))
            .map((token) => token.address as `0x${string}`);

          logger.info(`Found ${spamAddresses.size} spam tokens by patterns`);

          let batchSellable: Array<string> = [];
          let batchBurnable: Array<string> = [...spamAddresses];
          await checkTokensSellability(
            tokenAddresses,
            receivedToken as string,
            appName,
            selectedNetwork.id,
            (pools, chunkTokens) => {
              const sellable = new Set<string>();
              for (const pool of pools) {
                const token0 = pool.token0.id.toLowerCase();
                const token1 = pool.token1.id.toLowerCase();
                const dynamicToken = [token0, token1].find(
                  (t) => t !== receivedToken.toLowerCase()
                );
                if (dynamicToken) {
                  sellable.add(dynamicToken);
                }
              }
              const chunkSellable = chunkTokens.filter((t) => sellable.has(t.toLowerCase()));
              const chunkBurnable = chunkTokens.filter((t) => !sellable.has(t.toLowerCase()));
              batchSellable = [...batchSellable, ...chunkSellable];
              batchBurnable = [...batchBurnable, ...chunkBurnable];
              setState((prev) => ({
                ...prev,
                tokensToSell: convertAddressesToTokens(batchSellable, tokens),
                tokensToBurn: convertAddressesToTokens(batchBurnable, tokens),
                isPending: true,
              }));
            }
          );
          setCachedResult(selectedNetwork.id, address as string, {
            sellable: batchSellable,
            burnable: batchBurnable,
          });

          setState((prev) => ({ ...prev, isPending: false }));
        }
      } catch (err) {
        logger.error("Error checking tokens:", err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error("Failed to check tokens"),
          isPending: false,
        }));
      } finally {
        logger.info("Finishing token check");
        isCheckingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // All dependencies that are not stable functions or refs:
    [address, logger, receivedToken, selectedNetwork.id, tokens]
  );

  useEffect(
    () => {
      const currentTokenAddresses = tokens.map((t) => t.address.toLowerCase());
      const prevTokenAddresses = prevTokensRef.current;

      const hasTokensChanged =
        currentTokenAddresses.length !== prevTokenAddresses.length ||
        !currentTokenAddresses.every((addr, i) => addr === prevTokenAddresses[i]);

      if (hasTokensChanged && tokens.length > 0 && receivedToken) {
        setState((prev) => ({ ...prev, isPending: true, tokensToBurn: [], tokensToSell: [] }));
        prevTokensRef.current = currentTokenAddresses;
        checkTokens();
      } else if (!receivedToken || tokens.length === 0) {
        logger.info("No tokens found for a wallet or received token, resetting state");
        setState((prev) => ({ ...prev, isPending: false, tokensToBurn: [], tokensToSell: [] }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // selectedNetwork.id is a dependency of checkTokens.
    [checkTokens, logger, receivedToken, tokens]
  );

  return {
    checkTokens,
    tokensToBurn: state.tokensToBurn,
    tokensToSell: state.tokensToSell,
    isPending: state.isPending,
    error: state.error,
  };
};
