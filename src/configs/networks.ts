import { getNetworkInfo } from "@/lib/utils";
import {
  base,
  mainnet,
  zksync,
  mantle,
  polygon,
  optimism,
  mode,
  linea,
  scroll,
  arbitrum,
  fantom,
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import dotenv from "dotenv";
import type { SupportedChain, EnvChainsProps } from "@/types/networks";

dotenv.config();

if (!process.env.NEXT_PUBLIC_SUPPORTED_CHAINS) {
  throw new Error("NEXT_PUBLIC_SUPPORTED_CHAINS is not set");
}

const supportedChains: Record<string, EnvChainsProps> = JSON.parse(
  process.env.NEXT_PUBLIC_SUPPORTED_CHAINS
);
const supportedChainIds: Array<number> = Object.keys(supportedChains).map((id) => Number(id));

export const wagmiNetworks: Array<AppKitNetwork> = [
  base,
  mainnet,
  zksync,
  mantle,
  polygon,
  optimism,
  mode,
  linea,
  scroll,
  arbitrum,
  fantom,
];
const wagmiNetworkIds = new Set(wagmiNetworks.map((network) => network.id));

const intersectedChainIds = supportedChainIds.filter((chainId) => wagmiNetworkIds.has(chainId));

const intersectedChains = intersectedChainIds.map((chainId: number) => {
  const wagmiNetwork = wagmiNetworks.find((network) => network.id === chainId);
  if (!wagmiNetwork) {
    throw new Error(`Network with chainId ${chainId} not found in wagmi networks`);
  }

  return {
    ...wagmiNetwork,
    explorerUrl: supportedChains[chainId.toString()].explorerUrl,
    apiUrl: supportedChains[chainId.toString()].apiUrl,
  };
});

export const networksConfig: Array<SupportedChain> = await Promise.all(
  intersectedChains.map(async (network) => {
    const chainInfo = await getNetworkInfo(Number(network.id));

    return {
      ...network,
      name: chainInfo?.name || network.name,
      logo: chainInfo?.logoUrl,
      explorerUrl: supportedChains[network.id.toString()].explorerUrl,
      apiUrl: supportedChains[network.id.toString()].apiUrl,
    } as SupportedChain;
  })
);
