import { parseUnits } from "viem";
import type { Phase } from "@/types/states";
import type { CopiesState } from "@/types/states";
import type { ApprovingToken } from "@/types/tokens";
import type { SelectedToken } from "@/types/tokens";
import { AGGREGATOR_CONTRACT_ADDRESS, TOKENS_TO_RECEIVE } from "@/utils/constants";
import { Link, Text } from "@chakra-ui/react";
import { appConfig } from "@/configs/app";

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
    contentSubtitle: (
      <>
        <Text>
          An error occurred while executing your trade. Please, try again or contact{" "}
          <Link color="accentMain" href={appConfig.supportLink}>
            our support
          </Link>
        </Text>
      </>
    ),
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

export const getStatusText = (isFetchingTokens: boolean, isSubgraphLoading: boolean) => {
  if (isFetchingTokens) {
    return "Fetching tokens...";
  }
  if (isSubgraphLoading) {
    return "Classifying tokens...";
  }

  return "Tokens loaded";
};
