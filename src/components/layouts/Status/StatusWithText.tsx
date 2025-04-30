import { StatusSpinner } from "@/ui/Spinner";
import { Flex, Text } from "@chakra-ui/react";

export const StatusWithText = ({ isLoading, text }: { isLoading: boolean; text: string }) => {
  return (
    <Flex flexDir="row" alignItems="center">
      <StatusSpinner isLoading={isLoading} size="xs" borderWidth="1px" />
      <Text color="gray.500" fontSize="sm">
        {text}
      </Text>
    </Flex>
  );
};
