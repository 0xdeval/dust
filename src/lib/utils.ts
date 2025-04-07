import { parseUnits } from "viem";
import type { Phase } from "./types/states";
import type { CopiesState } from "./types/states";
import type { ApprovingToken } from "./types/tokens";
import type { SelectedToken } from "./types/tokens";

export const stringToBigInt = (amount: string, decimals: number = 18) => {
  const bigIntAmount = parseUnits(amount, decimals);

  return bigIntAmount;
};

export const getCopies = (phase: Phase): CopiesState => {
  switch (phase) {
    case "CONNECT_WALLET":
      return {
        contentHeadline: "Connect Your Wallet",
        contentSubtitle: "Connect your wallet to start trading",
        contentButtonLabel: "Connect Wallet",
      };

    case "SELECT_TOKENS":
      return {
        contentHeadline: "Select Tokens to Sell",
        contentSubtitle: "Choose the tokens you want to sell",
        contentButtonLabel: "Continue",
      };

    case "APPROVE_TOKENS":
      return {
        contentHeadline: "Sell Tokens",
        contentSubtitle: "Approve selected tokens for trading",
        contentButtonLabel: "Approve All",
      };

    case "SELL_TOKENS":
      return {
        contentHeadline: "Execute Trade",
        contentSubtitle: "Review and confirm your trade",
        contentButtonLabel: "Confirm Trade",
      };

    case "COMPLETED":
      return {
        contentHeadline: "Trade Completed",
        contentSubtitle: "Your trade has been successfully executed",
        contentButtonLabel: "Done",
      };
  }
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
