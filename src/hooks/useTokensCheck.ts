import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Token } from "@/types/tokens";
import type { PublicClient } from "viem";
import type { TokenSellabilityResult } from "@/lib/smartContracts/checkTokenSellable";
import { checkTokensSellability } from "@/lib/smartContracts/checkTokenSellable";

interface TokenCheckResult {
  address: `0x${string}`;
  hasMethods: boolean;
}

interface UseTokenChecksResult {
  tokensToBurn: Array<Token>;
  tokensToSell: Array<Token>;
  isPending: boolean;
  error: Error | null;
}

export const useTokensCheck = (tokens: Array<Token>): UseTokenChecksResult => {
  const publicClient = usePublicClient() as PublicClient;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tokensToBurn, setTokensToBurn] = useState<Array<Token>>([]);
  const [tokensToSell, setTokensToSell] = useState<Array<Token>>([]);

  useEffect(() => {
    const checkTokens = async () => {
      if (!publicClient || tokens.length === 0) {
        setTokensToBurn([]);
        setTokensToSell([]);
        return;
      }

      setIsPending(true);
      setError(null);

      try {
        const tokenAddresses = Array.from(
          new Set(tokens.map((token) => token.address as `0x${string}`))
        );
        const results: Array<TokenSellabilityResult> = await checkTokensSellability(
          tokenAddresses,
          publicClient
        );

        const burnableTokens: Array<Token> = [];
        const sellableTokens: Array<Token> = [];

        tokens.forEach((token) => {
          const tokenResults = results.find((result) => result.address === token.address);
          if (tokenResults) {
            console.log("tokenResults", tokenResults);
            const hasAllMethods = tokenResults.proxyHasMethods || tokenResults.implHasMethods;
            if (hasAllMethods) {
              sellableTokens.push(token);
            } else {
              burnableTokens.push(token);
            }
          }
        });

        setTokensToBurn(burnableTokens);
        setTokensToSell(sellableTokens);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to check tokens"));
        setTokensToBurn([]);
        setTokensToSell([]);
      } finally {
        setIsPending(false);
      }
    };

    checkTokens();
  }, [tokens, publicClient]);

  return {
    tokensToBurn,
    tokensToSell,
    isPending,
    error,
  };
};
