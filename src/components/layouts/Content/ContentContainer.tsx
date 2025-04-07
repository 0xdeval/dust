import { Flex } from "@chakra-ui/react";

export const ContentContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Flex
      flexDirection="column"
      p={"60px 85px"}
      border="1px solid"
      borderColor="primaryBorder"
      borderRadius="12px"
      justifyContent={"flex-start"}
      alignItems={"flex-start"}
      bg={"bgSurface"}
      gap={"60px"}
    >
      {children}
    </Flex>
  );
};
