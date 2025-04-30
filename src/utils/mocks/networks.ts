import type { SupportedChain } from "@/types/networks";

export const MOCK_NETWORKS: Array<SupportedChain> = [
  {
    id: 1,
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      llama: { http: ["https://rpc.eth.com"] },
      default: { http: ["https://rpc.eth.com"] },
    },
    name: "Ethereum",
    explorerUrl: "https://eth.blockscout.com",
  },
  {
    id: 8453,
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      llama: { http: ["https://rpc.base.com"] },
      default: { http: ["https://rpc.base.com"] },
    },
    name: "Base",
    explorerUrl: "https://base.blockscout.com",
  },
];
