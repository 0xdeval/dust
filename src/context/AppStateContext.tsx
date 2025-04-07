"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { AppState, Phase } from "@/lib/types/states";
import { useAppState } from "@/hooks/useAppState";
import type { SelectedToken } from "@/lib/types/tokens";
import { Token } from "@/lib/types/tokens";

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

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppStateContext must be used within an AppStateProvider");
  }
  return context;
};
