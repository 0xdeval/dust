import { useState } from "react";
import type { AppState, Phase } from "@/types/states";
import { useAccount } from "wagmi";
import { getCopies } from "@/lib/utils";
import type { SelectedToken } from "@/types/tokens";
import { DEFAULT_TOKEN_TO_RECEIVE } from "@/lib/constants";
import type { SupportedChain } from "@/types/networks";
import { networksConfig } from "@/configs/networks";

export const useAppState = () => {
  const { isConnected } = useAccount();

  const [phase, setPhase] = useState<Phase | null>("CONNECT_WALLET");
  const [isReadyToSell, setIsReadyToSell] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<Array<SelectedToken>>([]);

  const [approvedTokens, setApprovedTokens] = useState<Array<SelectedToken>>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedChain>(networksConfig[0]);

  const [receivedToken, setReceivedToken] = useState<`0x${string}`>(
    DEFAULT_TOKEN_TO_RECEIVE.address
  );

  const defaultCopy = getCopies("CONNECT_WALLET");

  const [state, setState] = useState<AppState | null>({
    phase: phase,
    contentHeadline: defaultCopy.contentHeadline,
    contentSubtitle: defaultCopy.contentSubtitle,
    contentButtonLabel: defaultCopy.contentButtonLabel,
    receivedToken: receivedToken,
    selectedTokens: selectedTokens,
    approvedTokens: approvedTokens,
    isReadyToSell: isReadyToSell,
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
    receivedToken,
    setReceivedToken,
    selectedNetwork,
    setSelectedNetwork,
  };
};
