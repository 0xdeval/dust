"use client";

import { createContext, useContext, ReactNode } from "react";
import { AppState, Phase } from "@/lib/types/states";
import { useAppState } from "@/hooks/useAppState";
import { SelectedToken, Token } from "@/lib/types/tokens";

interface AppStateContextType {
  phase: Phase | null;
  state: AppState | null;
  approvedTokens: SelectedToken[];
  setApprovedTokens: (tokens: SelectedToken[]) => void;
  isReadyToSell: boolean;
  setIsReadyToSell: (isReadyToSell: boolean) => void;
  selectedTokens: SelectedToken[];
  setSelectedTokens: (tokens: SelectedToken[]) => void;
  updateState: (phase: Phase) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

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
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error(
      "useAppStateContext must be used within an AppStateProvider"
    );
  }
  return context;
};
