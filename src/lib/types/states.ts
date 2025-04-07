import { SelectedToken, Token } from "./tokens";

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
  approvedTokens?: SelectedToken[];
  selectedTokens?: SelectedToken[];
  isReadyToSell?: boolean;
}

export interface CopiesState {
  contentHeadline: string;
  contentSubtitle: string;
  contentButtonLabel: string;
}
