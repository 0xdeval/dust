import { parseUnits } from "viem";
import type { Phase } from "../types/states";
import type { CopiesState } from "../types/states";
import type { ApprovingToken } from "../types/tokens";
import type { SelectedToken } from "../types/tokens";
import { CHAINSSCOUT_URL } from "./constants";
import type { NetworkInfo } from "../types/utils";

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
        contentHeadline: "SELECT TOKENS TO SELL",
        contentSubtitle: "Choose the tokens you want to sell",
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

export const getNetworkInfo = async (chainId: number): Promise<NetworkInfo | null> => {
  if (cache[chainId]) {
    return cache[chainId];
  }

  try {
    const response = await fetch(`${CHAINSSCOUT_URL}/${chainId}`);

    if (!response.ok) {
      console.error(`Failed to fetch network info for chainId ${chainId}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      console.log(`Failed to fetch network info for chainId ${chainId}: ${response.statusText}`);
      return null;
    }

    cache[chainId] = data;

    return {
      name: data.name,
      logoUrl: data.logo,
      blockExplorer: data?.explorers[0]?.url,
    };
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
