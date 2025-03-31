"use client";

import { useAccount } from "wagmi";
import { Suspense } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Flex,
  Center,
} from "@chakra-ui/react";

import TokenSeller from "@/components/layouts/TokensSeller/TokenSeller";
import { WalletConnect } from "@/components/WalletConnect";
import { ColorModeButton } from "@/components/ui/color-mode";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <VStack>
      <ColorModeButton />
      <Box textAlign="center">
        <Heading as="h1" size="xl" mb={2}>
          Token Seller
        </Heading>
        <Text color="gray.600">
          Easily sell your unused tokens in one transaction
        </Text>
      </Box>

      <Suspense fallback={<Center py={4}>Loading...</Center>}>
        {!isConnected ? (
          <Flex
            bg="white"
            p={8}
            rounded="lg"
            shadow="md"
            minH="300px"
            direction="column"
            align="center"
            justify="center"
          >
            <Text mb={6} fontSize="lg" textAlign="center">
              Connect your wallet to get started
            </Text>
            <WalletConnect />
          </Flex>
        ) : (
          <TokenSeller />
        )}
      </Suspense>
    </VStack>
  );
}
