"use client";

import { Flex, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { TokenSelector } from "@/components/ui/Select";
import { useAppState } from "@/hooks/useAppState";
import { useAccount, useDisconnect } from "wagmi";
import { modal } from "@/context/WagmiContext";
import { AiOutlineDisconnect } from "react-icons/ai";
import { useAppStateContext } from "@/context/AppStateContext";
import { useEffect } from "react";
export function Header() {
  const { address } = useAccount();
  const { isConnected } = useAppState();
  const { disconnect } = useDisconnect();

  const { updateState } = useAppStateContext();

  const handleButtonAction = () => {
    if (!isConnected) {
      modal.open();
    } else {
      disconnect();
    }
  };

  useEffect(() => {
    if (isConnected) {
      updateState("SELECT_TOKENS");
    }

    if (!isConnected) {
      updateState("CONNECT_WALLET");
    }
  }, [isConnected]);

  return (
    <Flex as="header" width="100%" justifyContent="space-between" mb="50px">
      <Flex flexDirection="column" gap={4} alignItems="flex-start">
        <Logo logoSrcDefaultPath="/logo-black.png" logoSrcDarkPath="/logo-white.png" />
        <Flex justifyContent="flex-start" alignItems="center" gap="10px">
          to <TokenSelector />
        </Flex>
      </Flex>
      <Button
        variant={isConnected ? "outline" : "solid"}
        bg={isConnected ? "transparent" : "actionButtonSolid"}
        borderColor={isConnected ? "accentBorder" : "transparent"}
        size="sm"
        onClick={handleButtonAction}
      >
        {!isConnected ? (
          "Connect Wallet"
        ) : (
          <Flex justifyContent="center" gap="10px">
            <Text>
              {address?.slice(0, 4)}...{address?.slice(-4)}
            </Text>
            <AiOutlineDisconnect />
          </Flex>
        )}
      </Button>
      {/* <ColorModeButton /> */}
    </Flex>
  );
}
