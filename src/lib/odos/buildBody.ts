import {
  OdosQuoteRequest,
  InputToken,
  OutputToken,
  OdosExecuteRequest,
  BuildExecuteParams,
} from "@/lib/types/api/odos";

interface BuildQuoteParams {
  inputTokens: InputToken[];
  outputTokens: OutputToken[];
  userAddress: `0x${string}`;
  chainId?: number;
  slippageLimitPercent?: number;
}

export function buildQuoteRequest({
  inputTokens,
  outputTokens,
  userAddress,
  chainId = 1,
  slippageLimitPercent = 0.3,
}: BuildQuoteParams): OdosQuoteRequest {
  return {
    chainId,
    inputTokens: inputTokens.map((token) => ({
      tokenAddress: token.tokenAddress,
      amount: token.amount,
    })),
    outputTokens: outputTokens.map((token, index, array) => ({
      tokenAddress: token.tokenAddress,
      proportion: 1 / array.length, // Evenly distribute proportions
    })),
    userAddr: userAddress,
    slippageLimitPercent,
    disableRFQs: true,
    compact: true,
    referralCode: 0,
  };
}

export function buildExecuteRequest({
  userAddress,
  pathId,
  simulate = true,
}: BuildExecuteParams): OdosExecuteRequest {
  return {
    userAddr: userAddress,
    pathId,
    simulate,
  };
}
