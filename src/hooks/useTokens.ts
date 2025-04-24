import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { fetchTokens } from "@/lib/blockscout/api";
import type { Token } from "@/types/tokens";
import { useAppStateContext } from "@/context/AppStateContext";

export function useTokens() {
  const { address } = useAccount();
  const { selectedNetwork } = useAppStateContext();
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("Wallet info: ", address, selectedNetwork);
  useEffect(() => {
    async function fetchUserTokens() {
      if (!address || !selectedNetwork) {
        setTokens([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setTokens([]);

      console.log("fetching tokens");
      try {
        const fetchedTokens = await fetchTokens(address as string, selectedNetwork);
        console.log("fetchedTokens", fetchedTokens);
        setTokens(fetchedTokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setTokens([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserTokens();
  }, [address, selectedNetwork]);

  return { tokens, isLoading };
}
