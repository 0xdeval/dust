"use client";

import { useAppStateContext } from "@/context/AppStateContext";
import { WalletConnection } from "@/layouts/Features/WalletConnection/WalletConnection";
import { TokensSelection } from "@/layouts/Features/TokensSelect/TokensSelection";
import { TokensApprovals } from "@/layouts/Features/TokensApprovals/TokensApprovals";
import { TokensSell } from "@/layouts/Features/TokensSell/TokensSell";
import { useEffect } from "react";

export default function Home() {
  const { phase, state } = useAppStateContext();

  useEffect(() => {
    console.log("phase", phase);
    console.log("state", state);
  }, [state, phase]);

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
