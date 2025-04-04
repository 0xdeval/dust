import { useState, useEffect } from "react";
import { AppState, Phase } from "@/lib/types/states";
import { useAccount } from "wagmi";
import { modal } from "@/context/WagmiContext";
import { getCopies } from "@/lib/utils";

export const useAppState = () => {
  const { isConnected } = useAccount();
  const [phase, setPhase] = useState<Phase>("CONNECT_WALLET");
  const [state, setState] = useState<AppState | null>(null);

  const updateState = (newPhase: Phase, newStateButtonAction: () => void) => {
    const newCopy = getCopies(newPhase);

    setState({
      phase: newPhase,
      contentHeadline: newCopy.contentHeadline,
      contentSubtitle: newCopy.contentSubtitle,
      contentButtonLabel: newCopy.contentButtonLabel,
      contentButtonAction: newStateButtonAction,
    });

    setPhase(newPhase);
  };

  useEffect(() => {
    if (!isConnected) {
      updateState("CONNECT_WALLET", () => modal.open());
    }
  }, [isConnected]);

  return {
    phase,
    state,
    updateState,
    isConnected,
  };
};
