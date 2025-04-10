import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { fetchTokens } from "@/lib/blockscout/api";
import type { Token } from "@/types/tokens";
import { useAppStateContext } from "@/context/AppStateContext";
export function useTokens() {
  const { address } = useAccount();
  const { selectedNetwork } = useAppStateContext();
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTokens = useCallback(async () => {
    if (!address || !selectedNetwork) {
      return;
    }

    setIsLoading(true);
    setTokens([]);
    try {
      const fetchedTokens = await fetchTokens(address as string, selectedNetwork);
      setTokens(fetchedTokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedNetwork]);

  useEffect(() => {
    if (address) {
      console.log("Refetchiung with address and network: ", address, selectedNetwork);
      loadTokens();
    }
  }, [address, loadTokens, selectedNetwork]);

  return { tokens, isLoading, loadTokens };
}
