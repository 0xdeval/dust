export interface Token {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  rawBalance: bigint;
  logoURI: string | null;
  price: number;
}

export interface SelectedToken extends Token {
  isSelected: boolean;
}

export interface ApprovingToken extends SelectedToken {
  isApproving: boolean;
  isApproved: boolean;
}

export interface TokenToReceive {
  address: `0x${string}`;
  symbol: string;
  logoURI?: string;
  name: string;
  decimals: number;
}

export interface SelectItem {
  label: string | undefined;
  value: string;
  icon: string | undefined;
}
