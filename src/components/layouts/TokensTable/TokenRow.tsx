import { CustomCheckbox } from "@/components/ui/checkbox";
import { Token } from "@/lib/types/tokens";
import { Checkbox, Flex, Grid, Image, Text, Box } from "@chakra-ui/react";

type TokenRowProps = {
  token: Token;
  isSelected: boolean;
  onSelect: () => void;
};

export const TokenRow = ({ token, isSelected, onSelect }: TokenRowProps) => (
  <Grid
    templateColumns="50px 1fr 1fr"
    px={4}
    py={3}
    borderBottomWidth="1px"
    _hover={{ bg: "gray.50" }}
    gap={2}
    alignItems="center"
  >
    <Box>
      <CustomCheckbox
        isChecked={isSelected}
        onChange={onSelect}
        colorScheme="blue"
      />
    </Box>

    <Flex align="center" gap={2}>
      {token.logoURI ? (
        <Image
          src={token.logoURI}
          alt={token.symbol}
          boxSize="24px"
          borderRadius="full"
        />
      ) : (
        <Box boxSize="24px" borderRadius="full" bg="gray.200" />
      )}
      <Text fontWeight="medium">{token.symbol}</Text>
    </Flex>

    <Text textAlign="right">{token.balance}</Text>
  </Grid>
);
