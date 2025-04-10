export type EnvChainsProps = {
  explorerUrl: string;
  apiUrl?: string;
};

export type EnvChains = {
  [key: string]: EnvChainsProps;
};

export interface SupportedChain {
  id: number;
  name: string | undefined;
  logo: string | undefined;
  explorerUrl: string | undefined;
  apiUrl?: string | undefined;
}
