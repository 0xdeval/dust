"use client";

import { createContext, useContext, ReactNode } from "react";
import { AppState, Phase } from "@/lib/types/states";
import { useAppState } from "@/hooks/useAppState";

interface AppStateContextType {
  phase: Phase;
  state: AppState | null;
  updateState: (phase: Phase, newStateButtonAction: () => void) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const appState = useAppState();

  return (
    <AppStateContext.Provider value={appState}>
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
