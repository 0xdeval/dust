export type EnvChains = {
  [key: string]: string;
};

export interface SupportedChain {
  id: number;
  name: string | undefined;
  logo: string | undefined;
  blockExplorer: string | undefined;
}
