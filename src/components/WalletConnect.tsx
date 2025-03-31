"use client";

import { modal } from "@/context/WagmiProvider";
import { Button, Text, VStack } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";

import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const WalletConnect = () => {
  const { address, isConnected } = useAccount();

  const { disconnect } = useDisconnect();

  const handleConnect = async () => {
    try {
      modal.open();
    } catch (error) {
      toaster.create({
        description: "Failed to connect wallet. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (isConnected) {
      toaster.create({
        description: "Your wallet has been connected successfully",
        type: "success",
      });
    }
  }, [isConnected]);

  const handleDisconnect = async () => {
    try {
      disconnect();
      toaster.create({
        description: "Your wallet has been disconnected",
        type: "info",
      });
    } catch (error) {
      toaster.create({
        description: "Failed to disconnect wallet. Please try again.",
        type: "error",
      });
    }
  };

  if (isConnected) {
    return (
      <VStack>
        <Text fontSize="sm" color="gray.600">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </Text>
        <Button
          colorScheme="red"
          variant="outline"
          onClick={handleDisconnect}
          size="lg"
        >
          Disconnect Wallet
        </Button>
      </VStack>
    );
  }

  return (
    <Button
      colorScheme="blue"
      size="lg"
      onClick={handleConnect}
      loadingText="Connecting..."
    >
      Connect Wallet
    </Button>
  );
};
