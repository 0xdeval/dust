import { useEffect, useState } from "react";
import type { AppState, OperationType, Phase } from "@/types/states";
import { useAccount } from "wagmi";
import { getCopies, getDefaultTokenToReceive } from "@/utils/utils";
import type { SelectedToken } from "@/types/tokens";
import type { SupportedChain } from "@/types/networks";
import { appConfig } from "@/configs/app";

export const useAppState = () => {
  const { isConnected } = useAccount();

  const [phase, setPhase] = useState<Phase | null>(() =>
    isConnected ? "SELECT_TOKENS" : "CONNECT_WALLET"
  );
  const [isReadyToSell, setIsReadyToSell] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<Array<SelectedToken>>([]);

  const [approvedTokens, setApprovedTokens] = useState<Array<SelectedToken>>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedChain>(appConfig.networks[0]);

  const [originalNetwork, setOriginalNetwork] = useState<SupportedChain>(selectedNetwork);

  const [operationType, setOperationType] = useState<OperationType>("sell");

  const [receivedToken, setReceivedToken] = useState<`0x${string}`>(
    getDefaultTokenToReceive(selectedNetwork.id).address
  );

  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    if (!phase) return;

    const currentCopy = getCopies(phase);
    setState({
      phase,
      contentHeadline: currentCopy.contentHeadline,
      contentSubtitle: currentCopy.contentSubtitle,
      contentButtonLabel: currentCopy.contentButtonLabel,
      receivedToken,
      selectedTokens,
      approvedTokens,
      isReadyToSell,
    });
  }, [phase, receivedToken, selectedTokens, approvedTokens, isReadyToSell]);

  const updateState = (newPhase: Phase) => {
    setPhase(newPhase);
  };

  useEffect(() => {
    if (!isConnected) {
      setPhase("CONNECT_WALLET");
    } else if (phase === "CONNECT_WALLET") {
      setPhase("SELECT_TOKENS");
    }

    if (selectedNetwork !== originalNetwork) {
      setOriginalNetwork(selectedNetwork);
      setPhase("SELECT_TOKENS");
    }
  }, [phase, isConnected, selectedNetwork, originalNetwork]);

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
    operationType,
    setOperationType,
  };
};
