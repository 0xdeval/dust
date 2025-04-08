import { base } from "viem/chains";

export const networks = [base];

export const EXPLORER_URLS = networks.map((network) => network.blockExplorers?.default.url);
export const chainScout = "https://chains.blockscout.com/api/chains/";
