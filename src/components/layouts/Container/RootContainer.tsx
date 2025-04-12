import { Container } from "@chakra-ui/react";
import React from "react";

export const RootContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container
      w="100%"
      h="100vh"
      p={{ base: "50px 20px", md: "60px 50px", lg: "120px 200px" }}
      justifyContent="flex-start"
      alignItems="space-between"
    >
      {children}
    </Container>
  );
};
