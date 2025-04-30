import { Flex } from "@chakra-ui/react";
import type { SelectedToken } from "@/types/tokens";
import { TokenCard } from "@/layouts/Tokens/TokenCard";
import { ImageWithFallback } from "@/ui/ImageWithFallback";
import { EmptyTokenCard } from "@/ui/Skeletons/EmptyTokenCard";

interface Props {
  tokens: Array<SelectedToken>;
  isLoading: boolean;
  onCardSelect?: (token: SelectedToken) => void;
}

export const TokensList = ({ tokens, isLoading, onCardSelect }: Props) => {
  if (isLoading) {
    return <EmptyTokenCard count={5} />;
  }

  return (
    <Flex flexDirection="column" gap="10px" width="100%">
      {tokens.map((token) => (
        <TokenCard
          inputProps={{
            onChange: onCardSelect ? () => onCardSelect(token) : undefined,
          }}
          key={token.address}
          icon={
            <ImageWithFallback
              borderRadius="50%"
              srcUrl={token.logoURI ?? undefined}
              alt={token.name}
              w="20px"
              h="20px"
            />
          }
          width="100%"
          p="10px"
          size="lg"
          borderRadius="8px"
          fontSize={{ base: "14px", md: "18px" }}
          label={token.name}
          description={token.symbol}
          addon={`${token.balance} ${token.symbol}`}
        />
      ))}
    </Flex>
  );
};
