import type { TokenSellabilityResult } from "@/types/subgraph";
import { CACHE_KEY_PREFIX, CACHE_EXPIRY } from "@/utils/constants";

interface CachedResult {
  result: TokenSellabilityResult;
  timestamp: number;
}

export const getCacheKey = (chainId: number, userAddress: string) => {
  return `${CACHE_KEY_PREFIX}${chainId}_${userAddress}`;
};

export const getCachedResult = (
  chainId: number,
  userAddress: string
): TokenSellabilityResult | null => {
  const key = getCacheKey(chainId, userAddress);
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { result, timestamp }: CachedResult = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(key);
    return null;
  }

  return result;
};

export const setCachedResult = (
  chainId: number,
  userAddress: string,
  result: TokenSellabilityResult
) => {
  const key = getCacheKey(chainId, userAddress);
  const cacheData: CachedResult = {
    result,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
};
