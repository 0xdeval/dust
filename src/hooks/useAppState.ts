import { useState } from "react";
import type { AppState, Phase } from "@/lib/types/states";
import { useAccount } from "wagmi";
import { getCopies } from "@/lib/utils";
import type { SelectedToken } from "@/lib/types/tokens";
export const useAppState = () => {
  const { isConnected } = useAccount();

  const [phase, setPhase] = useState<Phase | null>("CONNECT_WALLET");
  const [isReadyToSell, setIsReadyToSell] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<Array<SelectedToken>>([]);

  const [approvedTokens, setApprovedTokens] = useState<Array<SelectedToken>>([]);

  const defaultCopy = getCopies("CONNECT_WALLET");

  const [state, setState] = useState<AppState | null>({
    phase: phase,
    contentHeadline: defaultCopy.contentHeadline,
    contentSubtitle: defaultCopy.contentSubtitle,
    contentButtonLabel: defaultCopy.contentButtonLabel,
    selectedTokens: [],
    approvedTokens: [],
    isReadyToSell: false,
  });

  const updateState = (newPhase: Phase) => {
    const newCopy = getCopies(newPhase);

    setState({
      phase: newPhase,
      contentHeadline: newCopy.contentHeadline,
      contentSubtitle: newCopy.contentSubtitle,
      contentButtonLabel: newCopy.contentButtonLabel,
    });

    setPhase(newPhase);
  };

  return {
    phase,
    state,
    updateState,
    isConnected,
    approvedTokens,
    setApprovedTokens,
    selectedTokens,
    setSelectedTokens,
    isReadyToSell,
    setIsReadyToSell,
  };
};
