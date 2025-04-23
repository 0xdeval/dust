import { parseUnits } from "viem";
import type { Phase } from "../types/states";
import type { CopiesState } from "../types/states";
import type { ApprovingToken } from "../types/tokens";
import type { SelectedToken } from "../types/tokens";
import type { NetworkInfo } from "../types/utils";
import { AGGREGATOR_CONTRACT_ADDRESS, TOKENS_TO_RECEIVE } from "./constants";

export const stringToBigInt = (amount: string, decimals: number = 18) => {
  const bigIntAmount = parseUnits(amount, decimals);

  return bigIntAmount;
};

export const getCopies = (phase: Phase): CopiesState => {
  switch (phase) {
    case "CONNECT_WALLET":
      return {
        contentHeadline: "CONNECT YOUR WALLET",
        contentSubtitle: "Connect your wallet to start trading",
        contentButtonLabel: "Connect Wallet",
      };

    case "SELECT_TOKENS":
      return {
        contentHeadline: "SELECT TOKENS",
        contentSubtitle:
          "Choose the tokens you want to sell or burn. One type of operation at a time so far",
        contentButtonLabel: "Continue",
      };

    case "APPROVE_TOKENS":
      return {
        contentHeadline: "APPROVING TOKENS",
        contentSubtitle: "Approve selected tokens for trading",
        contentButtonLabel: "Sell All",
      };

    case "SELL_TOKENS":
      return {
        contentHeadline: "SELLING TOKENS",
        contentSubtitle: "Review and confirm your trade",
        contentButtonLabel: "Confirm Trade",
      };

    case "COMPLETED":
      return {
        contentHeadline: "TRADE COMPLETED",
        contentSubtitle: "Your trade has been successfully executed",
        contentButtonLabel: "Done",
      };
  }
};

export const getTxnStatusCopies = (
  isError: boolean | null,
  props?: { [key: string]: string | `0x${string}` | undefined }
) => {
  switch (isError) {
    case true:
      return {
        contentHeadline: "TRADE FAILED",
        contentSubtitle: "Your trade has failed. Error: " + props?.error,
        contentButtonLabel: "Try again",
      };
    case false:
      return {
        contentHeadline: "TRADE IS COMPLETED",
        contentSubtitle:
          "Your trade has been successfully executed. Transaction hash: " + props?.hash,
        contentButtonLabel: "Dust again",
      };
  }
  return {
    contentHeadline: "ERROR OCCURED",
    contentSubtitle:
      "An error occurred while executing your trade. Please, try again or contact our support",
    contentButtonLabel: "Try again",
  };
};

export const mapTokensWithApprovalStatus = (
  selectedTokens: Array<SelectedToken>,
  approvedTokens: Array<SelectedToken>
): Array<ApprovingToken> => {
  return selectedTokens.map((token) => {
    const isApproved = approvedTokens.some(
      (approvedToken) => approvedToken.address === token.address
    );

    return {
      ...token,
      isApproving: !isApproved,
      isApproved: isApproved,
    };
  });
};

const cache: Record<number, NetworkInfo> = {};
export const networkInfoCache = cache;
export const getNetworkInfo = async (chainId: number): Promise<NetworkInfo | null> => {
  if (cache[chainId]) {
    return cache[chainId];
  }

  try {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/chains/${chainId}`);

    if (!response.ok) {
      console.error(`Failed to fetch network info for chainId ${chainId}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    cache[chainId] = data;

    return data;
  } catch (error) {
    console.error(`Error fetching network info for chainId ${chainId}:`, error);
    return null;
  }
};

export const txnErrorToHumanReadable = (error: string | undefined) => {
  if (error?.includes("User rejected the request")) {
    return "User rejected the request in his wallet. Try again";
  }
  return error;
};

export const truncateText = (text: string, mintCharacterLimit: number = 20) => {
  return text.length > mintCharacterLimit ? `${text.slice(0, mintCharacterLimit)}...` : text;
};

export const getDefaultTokenToReceive = (chainId: number) => {
  return TOKENS_TO_RECEIVE[chainId][0];
};

export const getAllTokensToReceiveForChain = (chainId: number) => {
  return TOKENS_TO_RECEIVE[chainId];
};

export const getAggregatorContractAddress = (chainId: number) => {
  return AGGREGATOR_CONTRACT_ADDRESS[chainId.toString()];
};

export const getAvaialbleToRecieveTokens = (chainId: number) => {
  return TOKENS_TO_RECEIVE[chainId];
};
