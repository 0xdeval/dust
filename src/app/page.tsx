"use client";

import { useAppStateContext } from "@/context/AppStateContext";
import { WalletConnection } from "@/components/layouts/Steps/WalletConnection/WalletConnection";
import { TokensSelection } from "@/components/layouts/Steps/TokensSelect/TokensSelection";
import { TokensApprovals } from "@/components/layouts/Steps/TokensApprovals/TokensApprovals";
import { TokensSell } from "@/components/layouts/Steps/TokensSell/TokensSell";
import { useEffect } from "react";
import { useLogger } from "@/hooks/useLogger";

export default function Home() {
  const logger = useLogger("page.tsx");

  const { phase, state } = useAppStateContext();

  useEffect(() => {
    logger.info("Current app phase:", phase);
    logger.info("Current app state:", state);
  }, [state, phase, logger]);

  const renderPhaseContent = () => {
    switch (phase) {
      case "CONNECT_WALLET":
        return <WalletConnection />;
      case "SELECT_TOKENS":
        return <TokensSelection />;
      case "APPROVE_TOKENS":
        return <TokensApprovals />;
      case "SELL_TOKENS":
        return <TokensSell />;
      default:
        return null;
    }
  };

  return renderPhaseContent();
}
