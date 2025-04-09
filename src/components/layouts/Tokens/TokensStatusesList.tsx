import { Flex, Skeleton } from "@chakra-ui/react";
import type { ApprovingToken } from "@/types/tokens";
import { TokenStatusCard } from "./TokenStatusCard";

interface Props {
  selectedTokens: Array<ApprovingToken>;
}

export const TokensStatusesCardsList = ({ selectedTokens }: Props) => {
  return (
    <Skeleton loading={!selectedTokens} w="100%">
      <Flex flexDirection="column" gap="10px">
        {selectedTokens.map((token) => (
          <TokenStatusCard
            key={token.address}
            logoUrl={token.logoURI || undefined}
            width="100%"
            p="10px"
            size="sm"
            borderRadius="8px"
            fontSize="18px"
            symbol={token.symbol}
            addon={`${token.balance} ${token.symbol}`}
            label={token.name}
            description={token.symbol}
            isLoading={token.isApproving}
          />
        ))}
      </Flex>
    </Skeleton>
  );
};
