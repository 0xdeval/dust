import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { checkTokensHaveMethods } from "@/lib/smartContracts/checkAbiMethods";
import type { Token } from "@/types/tokens";
import type { PublicClient } from "viem";

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
        const tokenAddresses = tokens.map((token) => token.address as `0x${string}`);
        const results = await checkTokensHaveMethods(tokenAddresses, publicClient);

        const burnableTokens: Array<Token> = [];
        const sellableTokens: Array<Token> = [];

        tokens.forEach((token) => {
          const tokenResults = results[token.address as `0x${string}`];
          if (tokenResults) {
            const hasAllMethods = Object.values(tokenResults).every((hasMethod) => hasMethod);
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
