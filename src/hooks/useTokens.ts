import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { fetchTokens } from "@/lib/blockscout/api";
import type { Token } from "@/lib/types/tokens";

export function useTokens() {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<Array<Token>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const fetchedTokens = await fetchTokens(address as string);
      setTokens(fetchedTokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadTokens();
    }
  }, [address]);

  return { tokens, isLoading, loadTokens };
}
