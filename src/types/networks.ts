import type { Chain } from "viem";

export type EnvChainsProps = {
  explorerUrl: string;
  apiUrl?: string;
};

export type EnvChains = {
  [key: string]: EnvChainsProps;
};

export interface SupportedChain extends Chain {
  logo?: string | undefined;
  explorerUrl: string | undefined;
  apiUrl?: string | undefined;
}
