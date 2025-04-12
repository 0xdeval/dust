import { Text } from "@chakra-ui/react";

import { NetworksSelector } from "../NetworkSelect/NetworksSelector";

import { Flex } from "@chakra-ui/react";
import { AiOutlineDisconnect } from "react-icons/ai";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKitNetwork } from "@reown/appkit/react";

import { useAppStateContext } from "@/context/AppStateContext";
import { modal } from "@/context/WagmiContext";
import type { SupportedChain } from "@/types/networks";
import { useCallback } from "react";
import { toaster } from "@/components/ui/Toaster";
import { Button } from "@/components/ui/Button";
import type { AppKitNetwork } from "@reown/appkit/networks";

interface Props {
  isPageLoading: boolean;
}

export const WalletAndChainsActions = ({ isPageLoading }: Props) => {
  const { isConnected, address } = useAccount();
  const { switchNetwork } = useAppKitNetwork();

  const { disconnect } = useDisconnect();

  const { setSelectedNetwork } = useAppStateContext();

  const handleSelectNetwork = useCallback(
    (network: SupportedChain) => {
      console.log("Switching to network: ", network, network.id);

      try {
        switchNetwork(network as AppKitNetwork);
        setSelectedNetwork(network);
        toaster.create({
          title: "Network switched",
          description: "Network switched to " + network.name,
        });
      } catch (error) {
        toaster.create({
          title: "Error",
          description: "Error switching chain: " + error,
          type: "error",
        });
      }
    },
    [setSelectedNetwork, switchNetwork]
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
        size={{ base: "xs", md: "sm" }}
        width="100%"
        alignItems="flex-end"
        isPageLoading={isPageLoading}
      />
      <Button
        variant={isConnected ? "outline" : "solid"}
        bg={isConnected ? "transparent" : "actionButtonSolid"}
        _hover={{ bg: "actionButtonSolidHover", color: "gray.900" }}
        borderColor={isConnected ? "accentBorder" : "transparent"}
        size={{ base: "xs", md: "sm" }}
        onClick={handleButtonAction}
        rightIcon={isConnected ? <AiOutlineDisconnect /> : undefined}
        loading={isPageLoading}
      >
        {!isConnected ? (
          "Connect Wallet"
        ) : (
          <Text>
            {address?.slice(0, 4)}...{address?.slice(-4)}
          </Text>
        )}
      </Button>
    </Flex>
  );
};
