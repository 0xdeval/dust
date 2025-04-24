import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { MdOutlineSearch } from "react-icons/md";

export const NoTokensStub = () => {
  return (
    <Flex direction="column" align="center" justify="center" w="100%" h="100%" minH="300px" p={6}>
      <VStack gap={4}>
        <Box position="relative" w="120px" h="120px">
          <MdOutlineSearch size={100} style={{ objectFit: "contain" }} />
        </Box>
        <Text fontSize="xl" fontWeight="bold">
          No Tokens Found
        </Text>
        <Text fontSize="md" color="textSecondary" textAlign="center" maxW="400px">
          We couldn't find any tokens in your wallet for the selected network. Try switching
          networks or make sure you have tokens in your wallet.
        </Text>
      </VStack>
    </Flex>
  );
};
