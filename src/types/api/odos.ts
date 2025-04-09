export interface OdosInputToken {
  tokenAddress: `0x${string}`; // Ensures checksummed address format
  amount: string; // Fixed integer precision amount
}

export interface OdosOutputToken {
  tokenAddress: `0x${string}`; // Ensures checksummed address format
  proportion: number; // Proportion of output (0-1)
}

export interface OdosQuoteRequest {
  chainId: number;
  inputTokens: Array<OdosInputToken>;
  outputTokens: Array<OdosOutputToken>;
  userAddr: `0x${string}`; // Checksummed user address
  slippageLimitPercent: number;
  referralCode?: number; // Optional referral code
  disableRFQs?: boolean; // Optional RFQ disable flag
  compact?: boolean; // Optional compact response flag
}

export interface OdosExecuteRequest {
  userAddr: `0x${string}`;
  pathId: string;
  simulate?: boolean;
}

export interface OdosQuoteResponse {
  deprecated: string;
  traceId: string;
  inTokens: Array<string>;
  outTokens: Array<string>;
  inAmounts: Array<string>;
  outAmounts: Array<string>;
  gasEstimate: number;
  dataGasEstimate: number;
  gweiPerGas: number;
  gasEstimateValue: number;
  inValues: Array<number>;
  outValues: Array<number>;
  netOutValue: number;
  priceImpact: number;
  percentDiff: number;
  partnerFeePercent: number;
  pathId: string;
  pathViz: Record<string, unknown>;
  pathVizImage: string;
  blockNumber: number;
}

export interface ExecuteToken {
  tokenAddress: `0x${string}`;
  amount: string;
}

export interface Transaction {
  gas: number;
  gasPrice: number;
  value: string;
  to: string;
  from: string;
  data: string;
  nonce: number;
  chainId: number;
}

export interface SimulationError {
  type: string;
  errorMessage: string;
}

export interface Simulation {
  isSuccess: boolean;
  amountsOut: Array<number>;
  gasEstimate: number;
  simulationError?: SimulationError;
}

export interface OdosExecuteResponse {
  deprecated: string;
  traceId: string;
  blockNumber: number;
  gasEstimate: number;
  gasEstimateValue: number;
  inputTokens: Array<ExecuteToken>;
  outputTokens: Array<ExecuteToken>;
  netOutValue: number;
  outValues: Array<string>;
  transaction: Transaction;
  simulation: Simulation;
}

export interface OdosAssembleResponse {
  deprecated: string;
  traceId: string;
  blockNumber: number;
}
