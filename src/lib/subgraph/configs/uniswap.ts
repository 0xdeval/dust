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
    subgraphUrl: "api/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm",
  },
};
