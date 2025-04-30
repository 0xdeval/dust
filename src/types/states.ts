import type { SelectedToken } from "@/types/tokens";

export type Phase =
  | "CONNECT_WALLET"
  | "SELECT_TOKENS"
  | "APPROVE_TOKENS"
  | "SELL_TOKENS"
  | "COMPLETED";

export interface AppState {
  phase: Phase | null;
  contentHeadline: string;
  contentSubtitle: string;
  contentButtonLabel: string;
  approvedTokens?: Array<SelectedToken>;
  selectedTokens?: Array<SelectedToken>;
  isReadyToSell?: boolean;
  receivedToken?: `0x${string}`;
}

export interface CopiesState {
  contentHeadline: string;
  contentSubtitle: string;
  contentButtonLabel: string;
}

export type OperationType = "sell" | "burn";
