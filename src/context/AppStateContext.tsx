"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { AppState, Phase } from "@/types/states";
import { useAppState } from "@/hooks/useAppState";
import type { SelectedToken } from "@/types/tokens";
import type { SupportedChain } from "@/types/networks";

interface AppStateContextType {
  phase: Phase | null;
  state: AppState | null;
  approvedTokens: Array<SelectedToken>;
  setApprovedTokens: (tokens: Array<SelectedToken>) => void;
  isReadyToSell: boolean;
  setIsReadyToSell: (isReadyToSell: boolean) => void;
  selectedTokens: Array<SelectedToken>;
  setSelectedTokens: (tokens: Array<SelectedToken>) => void;
  updateState: (phase: Phase) => void;
  receivedToken: `0x${string}`;
  setReceivedToken: (receivedToken: `0x${string}`) => void;
  selectedNetwork: SupportedChain;
  setSelectedNetwork: (network: SupportedChain) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const {
    phase,
    state,
    approvedTokens,
    setApprovedTokens,
    isReadyToSell,
    setIsReadyToSell,
    selectedTokens,
    setSelectedTokens,
    updateState,
    receivedToken,
    setReceivedToken,
    selectedNetwork,
    setSelectedNetwork,
  } = useAppState();

  const value: AppStateContextType = {
    phase,
    state,
    approvedTokens,
    setApprovedTokens,
    isReadyToSell,
    setIsReadyToSell,
    selectedTokens,
    setSelectedTokens,
    updateState,
    receivedToken,
    setReceivedToken,
    selectedNetwork,
    setSelectedNetwork,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppStateContext must be used within an AppStateProvider");
  }
  return context;
};
