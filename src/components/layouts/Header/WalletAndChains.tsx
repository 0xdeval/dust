import { Button, Text } from "@chakra-ui/react";

import { NetworksSelector } from "../NetworkSelect/NetworksSelector";

import { Flex } from "@chakra-ui/react";
import { AiOutlineDisconnect } from "react-icons/ai";
import { useAccount, useDisconnect } from "wagmi";
import { useAppStateContext } from "@/context/AppStateContext";
import { modal } from "@/context/WagmiContext";
import type { SupportedChain } from "@/types/networks";
import { useCallback } from "react";

export const WalletAndChainsActions = () => {
  const { isConnected, address } = useAccount();

  const { disconnect } = useDisconnect();

  const { setSelectedNetwork } = useAppStateContext();

  const handleSelectNetwork = useCallback(
    (network: SupportedChain) => {
      setSelectedNetwork(network);
    },
    [setSelectedNetwork]
  );

  const handleButtonAction = useCallback(() => {
    if (!isConnected) {
      modal.open();
    } else {
      disconnect();
    }
  }, [isConnected, disconnect]);

  return (
    <Flex width="100%" justifyContent="flex-end" alignItems="flex-start" gap="10px">
      <NetworksSelector
        onSelectNetwork={handleSelectNetwork}
        size="sm"
        width="100%"
        alignItems="flex-end"
      />
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
    </Flex>
  );
};
