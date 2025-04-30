import type { TokenToReceive } from "@/types/tokens";

export const CHAINSSCOUT_URL = "https://chains.blockscout.com/api/chains";

export const AGGREGATOR_CONTRACT_ADDRESS: Record<string, `0x${string}`> = {
  "1": "0xCf5540fFFCdC3d510B18bFcA6d2b9987b0772559" as `0x${string}`,
  "10": "0xCa423977156BB05b13A2BA3b76Bc5419E2fE9680" as `0x${string}`,
  "137": "0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf" as `0x${string}`,
  "250": "0xD0c22A5435F4E8E5770C1fAFb5374015FC12F7cD" as `0x${string}`,
  "324": "0x4bBa932E9792A2b917D47830C93a9BC79320E4f7" as `0x${string}`,
  "5000": "0xD9F4e85489aDCD0bAF0Cd63b4231c6af58c26745" as `0x${string}`,
  "8453": "0x19cEeAd7105607Cd444F5ad10dd51356436095a1" as `0x${string}`,
  "34443": "0x7E15EB462cdc67Cf92Af1f7102465a8F8c784874" as `0x${string}`,
  "42161": "0xa669e7A0d4b3e4Fa48af2dE86BD4CD7126Be4e13" as `0x${string}`,
  "59144": "0x2d8879046f1559E53eb052E949e9544bCB72f414" as `0x${string}`,
  "534352": "0xbFe03C9E20a9Fc0b37de01A172F207004935E0b1" as `0x${string}`,
};

const COMMON_TOKENS: Record<string, Omit<TokenToReceive, "address">> = {
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    logoURI: undefined,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: undefined,
  },
};

export const TOKENS_TO_RECEIVE: Record<string, Array<TokenToReceive>> = {
  "1": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as `0x${string}`,
    },
    {
      ...COMMON_TOKENS.USDC,
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as `0x${string}`,
    },
  ],
  "137": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619" as `0x${string}`,
    },
    {
      ...COMMON_TOKENS.USDC,
      address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359" as `0x${string}`,
    },
  ],
  "8453": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0x4200000000000000000000000000000000000006" as `0x${string}`,
    },
    {
      ...COMMON_TOKENS.USDC,
      address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as `0x${string}`,
    },
  ],
  "324": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91" as `0x${string}`,
    },
    {
      ...COMMON_TOKENS.USDC,
      address: "0x1d17cbcf0d6d143135ae902365d2e5e2a16538d4" as `0x${string}`,
    },
  ],
  "5000": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111" as `0x${string}`,
    },
  ],
  "10": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0x4200000000000000000000000000000000000006" as `0x${string}`,
    },
    {
      ...COMMON_TOKENS.USDC,
      address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85" as `0x${string}`,
    },
  ],
  "34443": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0x4200000000000000000000000000000000000006" as `0x${string}`,
    },
    {
      ...COMMON_TOKENS.USDC,
      address: "0xd988097fb8612cc24eec14542bc03424c656005f" as `0x${string}`,
    },
  ],
  "59144": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f" as `0x${string}`,
    },
    {
      ...COMMON_TOKENS.USDC,
      address: "0x176211869ca2b568f2a7d4ee941e073a821ee1ff" as `0x${string}`,
    },
  ],
  "534352": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0x5300000000000000000000000000000000000004" as `0x${string}`,
    },
  ],
  "42161": [
    {
      ...COMMON_TOKENS.WETH,
      address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" as `0x${string}`,
    },
    {
      ...COMMON_TOKENS.USDC,
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
    },
  ],
  "250": [
    {
      symbol: "wFTM",
      name: "Wrapped Fantom",
      decimals: 18,
      logoURI: undefined,
      address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83" as `0x${string}`,
    },
    {
      symbol: "fUSD",
      name: "Fantom USD",
      decimals: 18,
      logoURI: undefined,
      address: "0xad84341756bf337f5a0164515b1f6f993d194e1f" as `0x${string}`,
    },
  ],
};

export const SUBGRAPH_BASE_URL = "https://gateway.thegraph.com";

export const CACHE_KEY_PREFIX = "token_sellability_";
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

export const TOKENS_FETCHING_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const MAX_RETRIES = 3;
export const INITIAL_RETRY_DELAY = 1000; // 1 second
