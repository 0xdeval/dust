import { parseUnits } from "viem";
import type { Phase } from "@/types/states";
import type { CopiesState } from "@/types/states";
import type { ApprovingToken } from "@/types/tokens";
import type { SelectedToken } from "@/types/tokens";
import { AGGREGATOR_CONTRACT_ADDRESS, TOKENS_TO_RECEIVE } from "@/utils/constants";
import { Text } from "@chakra-ui/react";
import { appConfig } from "@/configs/app";
import { CustomLink } from "@/ui/CustomLink";
import type { SupportedChain } from "@/types/networks";

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

interface TxnStatusProps {
  error?: string;
  hash?: string;
  unsellableTokens?: Array<SelectedToken>;
  selectedNetwork?: SupportedChain;
}

export const getTxnStatusCopies = (isError: boolean | null, props?: TxnStatusProps) => {
  if (isError) {
    if (
      props?.unsellableTokens &&
      Array.isArray(props.unsellableTokens) &&
      props.unsellableTokens.length > 0
    ) {
      return {
        contentHeadline: "ROUTES FOR TOKENS NOT FOUND",
        contentSubtitle:
          "Routes for the following tokens: " +
          props.unsellableTokens.map((token) => token.symbol).join(", ") +
          " are not found",
        contentButtonLabel: "Sell rest",
      };
    }
    return {
      contentHeadline: "TRADE FAILED",
      contentSubtitle:
        "Something went wrong." +
        (props?.error ? ` Error: ${props.error}` : "") +
        "Please, " +
        <CustomLink href={appConfig.supportLink}>contact our support</CustomLink> +
        " if the problem persists",
      contentButtonLabel: "Try again",
    };
  }

  if (!isError) {
    return {
      contentHeadline: "TRADE IS COMPLETED",
      contentSubtitle: (
        <>
          Your trade has been successfully executed
          {props?.hash && (
            <CustomLink href={`${props?.selectedNetwork?.explorerUrl}/tx/${props?.hash}`}>
              Check details on Blockscout
            </CustomLink>
          )}
        </>
      ),
      contentButtonLabel: "Dust again",
    };
  }

  return {
    contentHeadline: "ERROR OCCURRED",
    contentSubtitle: (
      <Text>
        An error occurred while executing your trade. Please, try again or contact{" "}
        <CustomLink href={appConfig.supportLink}>our support</CustomLink>
      </Text>
    ),
    contentButtonLabel: "Try again",
  };
};

export const prepareTokensSellingIssueCopies = (
  tokensCanBeSold: Array<SelectedToken>,
  tokensCannotBeSold: Array<SelectedToken>
) => {
  return `We can't find routes for the following tokens: ${tokensCannotBeSold.map((token) => token.symbol).join(", ")}. 
  Do you want to sell the rest: ${tokensCanBeSold.map((token) => token.symbol).join(", ")}?`;
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
