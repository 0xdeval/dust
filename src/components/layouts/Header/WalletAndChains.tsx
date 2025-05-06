import { Text } from "@chakra-ui/react";
import { NetworksSelector } from "@/layouts/NetworkSelect/NetworksSelector";
import { Flex } from "@chakra-ui/react";
import { AiOutlineDisconnect } from "react-icons/ai";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useAppStateContext } from "@/context/AppStateContext";
import { modal } from "@/context/WagmiContext";
import type { SupportedChain } from "@/types/networks";
import { useCallback } from "react";
import { toaster } from "@/ui/CustomToaster";
import { Button } from "@/ui/Button";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { ColorModeButton } from "@/components/ui/ColorMode";

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
    <Flex
      flexDirection={{ base: "column", md: "row" }}
      width="100%"
      justifyContent={{ base: "flex-start", md: "flex-end" }}
      alignItems={{ base: "flex-end", md: "flex-start" }}
      gap="10px"
    >
      <Button
        variant={isConnected ? "outline" : "solid"}
        bg={isConnected ? "transparent" : "actionButtonSolid"}
        _hover={{ bg: "actionButtonSolidHover", color: "gray.900" }}
        borderColor={isConnected ? "accentBorder" : "transparent"}
        size="sm"
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
      <Flex gap={2}>
        <NetworksSelector
          onSelectNetwork={handleSelectNetwork}
          size="sm"
          width="100%"
          alignItems="flex-end"
          isPageLoading={isPageLoading}
        />
        <ColorModeButton size="sm" />
      </Flex>
    </Flex>
  );
};
