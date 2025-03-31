import { VStack, Text, Grid, Box } from "@chakra-ui/react";

import { TokenRow } from "./TokenRow";
import { Token } from "@/lib/types/tokens";

type TokenTableProps = {
  tokens: Token[];
  selectedTokens: Record<string, boolean>;
  onTokenSelect: (address: string) => void;
};

export function TokenTable({
  tokens,
  selectedTokens,
  onTokenSelect,
}: TokenTableProps) {
  return (
    <Box overflowX="auto" width="full">
      <VStack width="full" align="stretch">
        <Grid
          templateColumns="50px 1fr 1fr"
          px={4}
          py={3}
          borderBottomWidth="1px"
          bg="gray.50"
          gap={2}
        >
          <Box />
          <Text fontWeight="semibold">Token</Text>
          <Text fontWeight="semibold" textAlign="right">
            Balance
          </Text>
        </Grid>

        {tokens.map((token: Token) => (
          <TokenRow
            key={token.address}
            token={token}
            isSelected={!!selectedTokens[token.address]}
            onSelect={() => onTokenSelect(token.address)}
          />
        ))}
      </VStack>
    </Box>
  );
}
