"use client";

import { Box, Container, Flex, Image } from "@chakra-ui/react";
import { WalletConnect } from "@/components/WalletConnect";
import { ColorModeButton } from "@/components/ui/color-mode";
export function Header() {
  return (
    <Box
      as="header"
      width="full"
      borderBottom="1px"
      borderColor="gray.100"
      bg="white"
    >
      <Container maxW="7xl" py={4}>
        <Flex justify="center" align="center" gap={8}>
          <Image
            src="/dust.webp"
            alt="Logo"
            height={8}
            objectFit="contain"
            // fallback={<Box width={8} height={8} bg="gray.100" rounded="md" />}
          />

          <WalletConnect />
          <ColorModeButton />
        </Flex>
      </Container>
    </Box>
  );
}
