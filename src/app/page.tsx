"use client";

import { useAppStateContext } from "@/context/AppStateContext";
import { WalletConnection } from "@/components/layouts/Features/WalletConnection/WalletConnection";
import { TokensSelection } from "@/components/layouts/Features/TokensSelect/TokensSelection";
import { TokensApprovals } from "@/components/layouts/Features/TokensApprovals/TokensApprovals";
import { TokensSell } from "@/components/layouts/Features/TokensSell/TokensSell";

export default function Home() {
  const { phase } = useAppStateContext();

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
