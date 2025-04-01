"use client";

import {
  Box,
  VStack,
  Heading,
  Button,
  Text,
  Flex,
  Alert,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";

import { useEffect, useMemo, useRef, useState } from "react";
import { TokenTable } from "@/components/layouts/TokensTable/Table";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { useAccount } from "wagmi";
import { AGGREGATOR_CONTRACT_ADDRESS } from "@/lib/constants";
import { useTokens } from "@/hooks/useTokens";
import { stringToBigInt } from "@/lib/utils";
import { usePrepareTokensSell } from "@/hooks/usePrepareTokensSell";
import { TokenSelector } from "@/components/ui/TokenSelector";
import { TokenToReceive } from "@/lib/types/tokens";
export default function TokenSeller() {
  const { address } = useAccount();

  const { tokens, isLoading } = useTokens();

  const initialSelectedTokens = useMemo(() => {
    return tokens.reduce((acc, token) => {
      acc[token.address] = false;
      return acc;
    }, {} as Record<string, boolean>);
  }, [tokens]);

  const [selectedTokens, setSelectedTokens] = useState<Record<string, boolean>>(
    initialSelectedTokens
  );
  const [approvedTokens, setApprovedTokens] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isReadyToSell, setIsReadyToSell] = useState(false);

  const { setTokensToSell, tokenToReceive, setTokenToReceive, status } =
    usePrepareTokensSell();

  const handleTokenToReceiveSelect = (token: TokenToReceive) => {
    setTokenToReceive([
      {
        tokenAddress: token.address,
        proportion: 1,
      },
    ]);
  };

  const {
    setTokenToApprove,
    setTokenToApproveBalance,
    isTokenApproved,
    isApproving,
    allowanceError,
    contractTokenApprovalError,
    resetApprovalRequest,
  } = useTokenApproval({
    owner: address as `0x${string}`,
    spender: AGGREGATOR_CONTRACT_ADDRESS,
  });

  const approvalStateRef = useRef({
    isTokenApproved,
    isApproving,
    allowanceError,
    contractTokenApprovalError,
  });

  useEffect(() => {
    console.log("Current token state in use effect:", {
      isTokenApproved,
      isApproving,
      allowanceError,
      contractTokenApprovalError,
    });
    approvalStateRef.current = {
      isTokenApproved,
      isApproving,
      allowanceError,
      contractTokenApprovalError,
    };
  }, [
    isTokenApproved,
    isApproving,
    allowanceError,
    contractTokenApprovalError,
  ]);

  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedTokens((prev) => ({
      ...prev,
      [tokenAddress]: !prev[tokenAddress],
    }));
  };

  const handleSellTokens = async () => {
    toaster.create({
      title: "Selling tokens",
      description: `Sign a message to sell tokens`,
      type: "loading",
    });

    const tokensToSell = approvedTokens.map((token) => {
      return {
        tokenAddress: token as `0x${string}`,
        amount: tokens.find((t) => t.address === token)!.balance,
      };
    });

    setTokensToSell(tokensToSell);
  };

  const handleApproveTokens = async () => {
    const selectedTokenAddresses = Object.entries(selectedTokens)
      .filter(([_, isSelected]) => isSelected)
      .map(([address]) => address);

    for (const tokenAddress of selectedTokenAddresses) {
      try {
        resetApprovalRequest(); // Reset state before processing new token
        const currentTokenBalance = tokens.find(
          (token) => token.address === tokenAddress
        )?.balance;

        if (!currentTokenBalance) {
          toaster.create({
            title: "Error",
            description: `Token ${tokenAddress} has no balance`,
            type: "error",
          });
          continue;
        }

        console.log(
          "Approving token",
          tokenAddress,
          " with balance: ",
          currentTokenBalance
        );
        setTokenToApprove(tokenAddress as `0x${string}`);
        setTokenToApproveBalance(stringToBigInt(currentTokenBalance));
        console.log("Current token to approve", tokenAddress);
        console.log("Current is token approved", isTokenApproved);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(
          "State after the delay:",
          isTokenApproved,
          isApproving,
          allowanceError,
          contractTokenApprovalError
        );

        while (true) {
          const {
            isTokenApproved,
            isApproving,
            allowanceError,
            contractTokenApprovalError,
          } = approvalStateRef.current;

          console.log("Live approval state", {
            isTokenApproved,
            isApproving,
            allowanceError,
            contractTokenApprovalError,
          });

          if (isTokenApproved) {
            console.log("Token approved", tokenAddress);
            setApprovedTokens((prev) => [...prev, tokenAddress]);
            toaster.create({
              title: "Success",
              description: `Approved token ${tokenAddress}`,
              type: "success",
            });
            break;
          }

          // if (
          //   !isApproving &&
          //   isTokenApproved &&
          //   !(allowanceError || contractTokenApprovalError)
          // )
          //   break;

          if (contractTokenApprovalError) {
            // allowanceError
            console.log(
              "Error approving token",
              tokenAddress,
              allowanceError,
              contractTokenApprovalError
            );

            toaster.create({
              title: "Error",
              description: `Error approving token ${tokenAddress}`,
              type: "error",
            });
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        toaster.create({
          title: "Error",
          description: `Error approving token ${tokenAddress}`,
          type: "error",
        });
        break;
      }
    }

    // Reset the approval state at the end
    setTokenToApprove(null);
  };

  useEffect(() => {
    if (
      approvedTokens.length ===
        Object.values(selectedTokens).filter(Boolean).length &&
      approvedTokens.length > 0
    ) {
      toaster.create({
        title: "Success",
        description: `All tokens approved. Selling ${approvedTokens.length} tokens...`,
        type: "success",
      });

      setIsReadyToSell(true);
    }
  }, [approvedTokens, selectedTokens]);

  return (
    <Box p={6} rounded="lg" bg="white" shadow="md">
      <TokenSelector
        selectedToken={tokenToReceive[0]}
        onSelect={handleTokenToReceiveSelect}
      />
      <VStack gap={6} align="stretch">
        <Heading size="lg">Select tokens to approve</Heading>

        <TokenTable
          tokens={tokens} // You'll need to provide your tokens data here
          selectedTokens={selectedTokens}
          onTokenSelect={handleTokenSelect}
        />

        <Flex justify="space-between" align="center">
          <Text>{approvedTokens.length} tokens approved</Text>
        </Flex>

        {Object.keys(selectedTokens).length > 0 && (
          <Flex justify="space-between" align="center">
            <Text>
              {Object.values(selectedTokens).filter(Boolean).length} tokens
              selected
            </Text>

            {Object.values(selectedTokens).some(Boolean) && (
              <Button
                colorScheme="blue"
                onClick={isReadyToSell ? handleSellTokens : handleApproveTokens}
                loading={isProcessing}
                loadingText="Approving..."
              >
                {isReadyToSell ? "Sell Tokens" : "Approve Tokens"}
              </Button>
            )}
          </Flex>
        )}

        {approvedTokens.length > 0 && (
          <VStack align="stretch" gap={2}>
            <Text fontWeight="medium">Approved Tokens:</Text>
            {approvedTokens.map((token) => (
              <Text key={token} fontSize="sm" color="gray.600">
                {token}
              </Text>
            ))}
          </VStack>
        )}
      </VStack>
      <Toaster />
    </Box>
  );
}
