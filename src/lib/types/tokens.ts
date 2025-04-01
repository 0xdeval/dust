export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  rawBalance: bigint;
  logoURI: string | null;
  price: number;
}

export interface TokenToReceive {
  address: `0x${string}`;
  symbol: string;
  logoURI?: string;
  name: string;
  decimals: number;
}
