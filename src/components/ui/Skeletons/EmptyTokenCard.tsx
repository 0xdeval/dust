import { Flex } from "@chakra-ui/react";

import { Skeleton } from "@chakra-ui/react";

export const EmptyTokenCard = ({ count = 5 }: { count?: number }) => {
  return (
    <Flex w="full" h="full" align="stretch" direction="column" gap="10px">
      {[...Array(count)].map((idx) => (
        <Skeleton key={idx} w="100%" h="60px" borderRadius="8px" flexShrink={0} />
      ))}
    </Flex>
  );
};
