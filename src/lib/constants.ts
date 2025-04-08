import type { TokenToReceive } from "./types/tokens";

export const AGGREGATOR_CONTRACT_ADDRESS = "0x19ceead7105607cd444f5ad10dd51356436095a1";

export const TOKENS_TO_RECEIVE: Array<TokenToReceive> = [
  {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
  },
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
];

export const DEFAULT_TOKEN_TO_RECEIVE: TokenToReceive = TOKENS_TO_RECEIVE[0];
