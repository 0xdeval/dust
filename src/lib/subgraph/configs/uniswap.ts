import type { SubgraphConfig } from "@/types/subgraph";

export const UNISWAP_SUBGRAPH_CONFIGS: Record<string, SubgraphConfig> = {
  "1": {
    name: "Ethereum Mainnet",
    subgraphUrl: "api/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
  },
  "8453": {
    name: "Base Mainnet",
    subgraphUrl: "api/subgraphs/id/43Hwfi3dJSoGpyas9VwNoDAv55yjgGrPpNSmbQZArzMG",
  },
  "137": {
    name: "Polygon Mainnet",
    subgraphUrl: "api/subgraphs/id/CwpebM66AH5uqS5sreKij8yEkkPcHvmyEs7EwFtdM5ND",
    // V4: CwpebM66AH5uqS5sreKij8yEkkPcHvmyEs7EwFtdM5ND
  },
  "324": {
    name: "zkSync Mainnet",
    subgraphUrl: "api/subgraphs/id/AKMoyKWWTwmNxa36nLKrRPauBSjmFST7kn6XdXAc6xVP",
  },
  "10": {
    name: "Optimism Mainnet",
    subgraphUrl: "api/subgraphs/id/Cghf4LfVqPiFw6fp6Y5X5Ubc8UpmUhSfJL82zwiBFLaj",
    // V3: Cghf4LfVqPiFw6fp6Y5X5Ubc8UpmUhSfJL82zwiBFLaj
    // V4: 6RBtsmGUYfeLeZsYyxyKSUiaA6WpuC69shMEQ1Cfuj9u
  },
  "42161": {
    name: "Arbitrum One Mainnet",
    subgraphUrl: "api/subgraphs/id/7nvDQ1xwqnjVHJ21iQCtVKVvkWPsMvHjNjGTbVNn9wUU",
    // V3: 7nvDQ1xwqnjVHJ21iQCtVKVvkWPsMvHjNjGTbVNn9wUU
    // V4: G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r
  },
};
