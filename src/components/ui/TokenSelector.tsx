"use client";

import {
  Portal,
  Select,
  Stack,
  Image,
  Box,
  Flex,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import { TOKENS_TO_RECEIVE } from "@/lib/constants";
import type { TokenToReceive } from "@/lib/types/tokens";
import type { OutputToken } from "@/lib/types/api/odos";

interface TokenSelectorProps {
  onSelect: (token: TokenToReceive) => void;
  selectedToken?: OutputToken;
}

export function TokenSelector({ onSelect, selectedToken }: TokenSelectorProps) {
  const tokenCollection = createListCollection({
    items: TOKENS_TO_RECEIVE.map((token) => ({
      ...token,
      value: token.address,
      label: token.symbol,
    })),
  });

  const selectedTokenWithDetails = tokenCollection.items.find(
    (token) => token.value === selectedToken?.tokenAddress
  );

  const CustomTokenItem = (token: TokenToReceive) => (
    <Flex align="center" gap={3} width="full" py={2}>
      {token.logoURI ? (
        <Image src={token.logoURI} alt={token.symbol} boxSize="24px" borderRadius="full" />
      ) : (
        <Box boxSize="24px" bg="gray.100" borderRadius="full" />
      )}
      <Stack>
        <Text fontWeight="medium">{token.symbol}</Text>
        <Text fontSize="sm" color="gray.500">
          {token.name}
        </Text>
      </Stack>
    </Flex>
  );

  return (
    <Stack width="full">
      <Select.Root
        size="lg"
        collection={tokenCollection}
        onChange={(token) => onSelect(token as unknown as TokenToReceive)}
      >
        <Select.HiddenSelect />
        <Select.Label>Select Token to Receive</Select.Label>
        <Select.Control>
          <Select.Trigger>
            {selectedTokenWithDetails ? (
              <CustomTokenItem {...selectedTokenWithDetails} />
            ) : (
              <Select.ValueText placeholder="Select token" />
            )}
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {tokenCollection.items.map((token) => (
                <Select.Item item={token} key={token.value}>
                  <CustomTokenItem {...token} />
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Stack>
  );
}
