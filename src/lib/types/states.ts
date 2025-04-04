export type Phase =
  | "CONNECT_WALLET"
  | "SELECT_TOKENS"
  | "APPROVE_TOKENS"
  | "SELL_TOKENS"
  | "COMPLETED";

export interface AppState {
  phase: Phase;
  contentHeadline: string;
  contentSubtitle: string;
  contentButtonLabel: string;
  contentButtonAction: () => void;
}

export interface CopiesState {
  contentHeadline: string;
  contentSubtitle: string;
  contentButtonLabel: string;
}
