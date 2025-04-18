import type { PublicClient } from "viem";
import {
  EIP_1967_IMPLEMENTATION_SLOT,
  CIRCLE_FIAT_TOKEN_PROXY_SLOT,
  DAI_PROXY_SLOT,
  BEACON_PROXY_SLOT,
} from "../constants";

export const getImplementationAddress = async (
  client: PublicClient,
  proxyAddress: `0x${string}`
): Promise<`0x${string}` | null> => {
  const knownSlots = [
    // EIP-1967
    EIP_1967_IMPLEMENTATION_SLOT,
    // Circle (FiatTokenProxy)
    CIRCLE_FIAT_TOKEN_PROXY_SLOT,
    // DAI (DaiProxy)
    DAI_PROXY_SLOT,
    // Beacon (BeaconProxy)
    BEACON_PROXY_SLOT,
  ];

  for (const slot of knownSlots) {
    try {
      const storage = await client.getStorageAt({
        address: proxyAddress,
        slot: slot as `0x${string}`,
      });
      if (storage && storage !== "0x" && storage !== "0x000...000") {
        const implAddress = `0x${storage.slice(-40)}` as `0x${string}`;
        const code = await client.getCode({ address: implAddress });
        if (code && code !== "0x") return implAddress;
      }
    } catch {}
  }

  return null;
};
