import { useState, useEffect, useRef, useCallback } from "react";
import type { Token } from "@/types/tokens";
import { checkTokensSellability } from "@/utils/actions/checkTokensSellability";
import type { SubgraphAppName, TokenSellabilityResult } from "@/types/subgraph";
import { useAppStateContext } from "@/context/AppStateContext";
import { getCachedResult, setCachedResult } from "@/utils/cache";
import { convertAddressesToTokens } from "@/utils/tokensCheck";
import { useAccount } from "wagmi";

interface UseTokenChecksResult {
  checkTokens: (appName?: SubgraphAppName) => Promise<void>;
  tokensToBurn: Array<Token>;
  tokensToSell: Array<Token>;
  isPending: boolean;
  error: Error | null;
}

export const useTokensCheck = (tokens: Array<Token>): UseTokenChecksResult => {
  const [state, setState] = useState({
    isPending: false,
    error: null as Error | null,
    tokensToBurn: [] as Array<Token>,
    tokensToSell: [] as Array<Token>,
  });

  const prevTokensRef = useRef<Array<string>>([]);
  const isCheckingRef = useRef(false);

  const { selectedNetwork, receivedToken } = useAppStateContext();
  const { address } = useAccount();

  console.log(
    "Hook render - state:",
    state,
    "tokens length:",
    tokens.length,
    "receivedToken:",
    receivedToken
  );

  const checkTokens = useCallback(
    async (appName: SubgraphAppName = "uniswap") => {
      console.log("checkTokens called - tokens length:", tokens.length);

      if (!receivedToken) {
        console.log("No received token set");
        setState((prev) => ({ ...prev, isPending: false, tokensToBurn: [], tokensToSell: [] }));
        return;
      }

      if (tokens.length === 0) {
        console.log("No tokens to check");
        setState((prev) => ({ ...prev, isPending: false, tokensToBurn: [], tokensToSell: [] }));
        return;
      }

      if (isCheckingRef.current) {
        console.log("Already checking tokens, skipping");
        return;
      }

      console.log("Starting token check");
      isCheckingRef.current = true;
      setState((prev) => ({ ...prev, isPending: true, error: null }));

      try {
        const tokenAddresses = Array.from(
          new Set(tokens.map((token) => token.address as `0x${string}`))
        );

        // Check cache first
        const cachedResult = getCachedResult(selectedNetwork.id, address as string);
        let results: TokenSellabilityResult;

        if (cachedResult) {
          console.log("Using cached result");
          results = cachedResult;
          setState((prev) => ({
            ...prev,
            tokensToBurn: convertAddressesToTokens(results.burnable, tokens),
            tokensToSell: convertAddressesToTokens(results.sellable, tokens),
            isPending: false,
          }));
        } else {
          console.log("Fetching new results");
          results = await checkTokensSellability(
            tokenAddresses,
            receivedToken as string,
            appName,
            selectedNetwork.id
          );
          setCachedResult(selectedNetwork.id, address as string, results);
          setState((prev) => ({
            ...prev,
            tokensToBurn: convertAddressesToTokens(results.burnable, tokens),
            tokensToSell: convertAddressesToTokens(results.sellable, tokens),
            isPending: false,
          }));
        }
      } catch (err) {
        console.error("Error checking tokens:", err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error("Failed to check tokens"),
          isPending: false,
        }));
      } finally {
        console.log("Finishing token check");
        isCheckingRef.current = false;
      }
    },
    [tokens, selectedNetwork.id, receivedToken, address]
  );

  useEffect(() => {
    const currentTokenAddresses = tokens.map((t) => t.address.toLowerCase());
    const prevTokenAddresses = prevTokensRef.current;

    const hasTokensChanged =
      currentTokenAddresses.length !== prevTokenAddresses.length ||
      !currentTokenAddresses.every((addr, i) => addr === prevTokenAddresses[i]);

    console.log(
      "useEffect - hasTokensChanged:",
      hasTokensChanged,
      "tokens length:",
      tokens.length,
      "receivedToken:",
      receivedToken
    );

    if (hasTokensChanged && tokens.length > 0 && receivedToken) {
      console.log("Triggering new token check");
      setState((prev) => ({ ...prev, isPending: true, tokensToBurn: [], tokensToSell: [] }));
      prevTokensRef.current = currentTokenAddresses;
      checkTokens();
    } else if (!receivedToken || tokens.length === 0) {
      console.log("No tokens or received token, resetting state");
      setState((prev) => ({ ...prev, isPending: false, tokensToBurn: [], tokensToSell: [] }));
    }
  }, [tokens, selectedNetwork.id, receivedToken, checkTokens]);

  return {
    checkTokens,
    tokensToBurn: state.tokensToBurn,
    tokensToSell: state.tokensToSell,
    isPending: state.isPending,
    error: state.error,
  };
};
