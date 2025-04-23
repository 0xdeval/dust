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
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokensToBurn, setTokensToBurn] = useState<Array<Token>>([]);
  const [tokensToSell, setTokensToSell] = useState<Array<Token>>([]);
  const prevTokensRef = useRef<Array<string>>([]);

  const { selectedNetwork, receivedToken } = useAppStateContext();
  const { address } = useAccount();

  console.log("tokensToSell", tokensToSell);
  console.log("tokensToBurn", tokensToBurn);

  const checkTokens = useCallback(
    async (appName: SubgraphAppName = "uniswap") => {
      if (tokens.length === 0) {
        setTokensToBurn([]);
        setTokensToSell([]);
        setIsPending(false);
        return;
      }

      setIsPending(true);
      setError(null);

      try {
        const tokenAddresses = Array.from(
          new Set(tokens.map((token) => token.address as `0x${string}`))
        );

        // Check cache first
        const cachedResult = getCachedResult(selectedNetwork.id, address as string);
        let results: TokenSellabilityResult;

        if (cachedResult) {
          results = cachedResult;
          // Update UI with cached results
          setTokensToBurn(convertAddressesToTokens(results.burnable, tokens));
          setTokensToSell(convertAddressesToTokens(results.sellable, tokens));
          setIsPending(false);
        } else {
          // Start the check in the background
          checkTokensSellability(
            tokenAddresses,
            receivedToken as string,
            appName,
            selectedNetwork.id
          )
            .then((results) => {
              setCachedResult(selectedNetwork.id, address as string, results);
              setTokensToBurn(convertAddressesToTokens(results.burnable, tokens));
              setTokensToSell(convertAddressesToTokens(results.sellable, tokens));
            })
            .catch((err) => {
              setError(err instanceof Error ? err : new Error("Failed to check tokens"));
            })
            .finally(() => {
              setIsPending(false);
            });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to check tokens"));
        setIsPending(false);
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

    if (hasTokensChanged && tokens.length > 0 && receivedToken) {
      setTokensToBurn([]);
      setTokensToSell([]);
      setIsPending(true);
      prevTokensRef.current = currentTokenAddresses;
      checkTokens();
    }
  }, [checkTokens, tokens, selectedNetwork.id, receivedToken]);

  return {
    checkTokens,
    tokensToBurn,
    tokensToSell,
    isPending,
    error,
  };
};
