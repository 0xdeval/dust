export interface BlockscoutResponse {
  items: Array<BlockscoutTokenItem>;
}

export interface BlockscoutTokenItem {
  token: {
    address: string;
    circulating_market_cap: string | null;
    decimals: string;
    exchange_rate: string | null;
    holders: string;
    icon_url: string | null;
    name: string;
    symbol: string;
    total_supply: string;
    type: string;
    volume_24h: string | null;
  };
  token_id: string | null;
  token_instance: unknown | null;
  value: string;
}
