"use client";

import { Flex } from "@chakra-ui/react";
import { useAppStateContext } from "@/context/AppStateContext";
import { useEffect } from "react";

import { WalletAndChainsActions } from "./WalletAndChains";
import { LogoAndTokens } from "./LogoAndTokens";
import { useAppState } from "@/hooks/useAppState";
export function Header() {
  const { isConnected } = useAppState();

  const { updateState } = useAppStateContext();

  useEffect(() => {
    if (isConnected) {
      updateState("SELECT_TOKENS");
    }

    if (!isConnected) {
      updateState("CONNECT_WALLET");
    }
  }, [isConnected, updateState]);

  return (
    <Flex as="header" width="100%" justifyContent="space-between" mb="50px">
      <LogoAndTokens />
      <WalletAndChainsActions />
      {/* <ColorModeButton /> */}
    </Flex>
  );
}
