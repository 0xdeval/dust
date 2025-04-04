import { Container } from "@chakra-ui/react";

export const RootContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container
      w={"100%"}
      h={"100vh"}
      p={"150px 250px"}
      as={"body"}
      justifyContent={"flex-start"}
      alignItems={"space-between"}
    >
      {children}
    </Container>
  );
};
