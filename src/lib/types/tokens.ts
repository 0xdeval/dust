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
