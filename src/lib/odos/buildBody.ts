import type {
  OdosQuoteRequest,
  OdosExecuteRequest,
  OdosInputToken,
  OdosOutputToken,
} from "@/types/api/odos";
import { appConfig } from "@/configs/app";
interface BuildQuoteParams {
  inputTokens: Array<OdosInputToken>;
  outputTokens: Array<OdosOutputToken>;
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
      proportion: 1 / array.length,
    })),
    userAddr: userAddress,
    slippageLimitPercent,
    disableRFQs: true,
    compact: true,
    referralCode: appConfig.odosPartnerKey,
  };
}

interface BuildExecuteProps {
  pathId: string;
  userAddress: `0x${string}`;
  simulate?: boolean;
}

export function buildExecuteRequest({
  pathId,
  userAddress,
  simulate,
}: BuildExecuteProps): OdosExecuteRequest {
  return {
    userAddr: userAddress,
    pathId: pathId,
    simulate: simulate,
  };
}
