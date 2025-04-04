import { Flex, Icon } from "@chakra-ui/react";
import { ContentHeadline } from "./ContentHeadline";
import { TokenCard } from "../Tokens/TokenCard";
import { FaEthereum } from "react-icons/fa";

export const InfoContainer = ({ children }: { children: React.ReactNode }) => {
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
      {/* <ContentHeadline /> */}
      {/* <TokenCard
        icon={<Icon as={FaEthereum} />}
        width={"100%"}
        p={"10px"}
        size={"lg"}
        borderRadius={"8px"}
        fontSize={"18px"}
        label="Ethereum"
        description="ETH"
        addon="1000 ETH"
      /> */}

      {children}
    </Flex>
  );
};
