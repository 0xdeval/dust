import type { NetworkInfo } from "@/types/utils";

const cache: Record<number, NetworkInfo> = {};
export const networkInfoCache = cache;

export const getNetworkInfo = async (chainId: number): Promise<NetworkInfo | null> => {
  if (cache[chainId]) {
    return cache[chainId];
  }

  try {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/chains/${chainId}`);

    if (!response.ok) {
      console.error(`Failed to fetch network info for chainId ${chainId}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    cache[chainId] = data;

    return data;
  } catch (error) {
    console.error(`Error fetching network info for chainId ${chainId}:`, error);
    return null;
  }
};
