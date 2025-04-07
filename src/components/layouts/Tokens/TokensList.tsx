import { Flex, Icon, Image, Skeleton } from "@chakra-ui/react";
import type { SelectedToken } from "@/lib/types/tokens";
import { TokenCard } from "./TokenCard";
import { FaCircle } from "react-icons/fa6";

interface Props {
  tokens: Array<SelectedToken>;
  isLoading: boolean;
  onCardSelect?: (token: SelectedToken) => void;
}

export const TokensList = ({ tokens, isLoading, onCardSelect }: Props) => {
  return (
    <Skeleton loading={isLoading} w="100%">
      <Flex flexDirection="column" gap="10px">
        {tokens.map((token) => (
          <TokenCard
            inputProps={{
              onChange: onCardSelect ? () => onCardSelect(token) : undefined,
            }}
            key={token.address}
            icon={
              token.logoURI ? (
                <Image src={token.logoURI} alt={token.name} w="20px" h="20px" />
              ) : (
                <Icon as={FaCircle} />
              )
            }
            width="100%"
            p="10px"
            size="lg"
            borderRadius="8px"
            fontSize="18px"
            label={token.name}
            description={token.symbol}
            addon={`${token.balance} ${token.symbol}`}
          />
        ))}
      </Flex>
    </Skeleton>
  );
};
