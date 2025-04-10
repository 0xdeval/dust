import { getNetworkInfo } from "@/lib/utils";
import * as allNetworks from "viem/chains";
import type { Chain } from "viem";
import dotenv from "dotenv";
import type { SupportedChain, EnvChainsProps } from "@/types/networks";

dotenv.config();

if (!process.env.NEXT_PUBLIC_SUPPORTED_CHAINS) {
  throw new Error("NEXT_PUBLIC_SUPPORTED_CHAINS is not set");
}

const supportedChains: Record<string, EnvChainsProps> = JSON.parse(
  process.env.NEXT_PUBLIC_SUPPORTED_CHAINS
);
const supportedChainIds: Array<number> = Object.keys(supportedChains).map(Number);

export const wagmiNetworks: Array<Chain> = Object.values(allNetworks);
const wagmiNetworkIds = new Set(wagmiNetworks.map((network) => network.id));

const intersectedChainIds = supportedChainIds.filter((chainId) => wagmiNetworkIds.has(chainId));

const intersectedChains = intersectedChainIds.map((chainId: number) => {
  const wagmiNetwork = wagmiNetworks.find((network) => network.id === chainId);
  return {
    id: chainId,
    name: wagmiNetwork?.name,
    explorerUrl: supportedChains[chainId.toString()].explorerUrl,
    apiUrl: supportedChains[chainId.toString()].apiUrl,
  };
});

export const networksConfig: Array<SupportedChain> = await Promise.all(
  intersectedChains.map(async (network) => {
    const chainInfo = await getNetworkInfo(network.id);

    const name = chainInfo?.name || network.name;
    const logoUrl = chainInfo?.logoUrl;
    const blockExplorer = network.explorerUrl;

    return {
      id: network.id,
      name: name,
      logo: logoUrl,
      explorerUrl: blockExplorer,
      apiUrl: network.apiUrl,
    } as SupportedChain;
  })
);
