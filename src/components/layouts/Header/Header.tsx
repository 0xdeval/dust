"use client";

import { Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { WalletAndChainsActions } from "@/layouts/Header/WalletAndChains";
import { LogoAndTokens } from "@/layouts/Header/LogoAndTokens";

export function Header() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Flex as="header" width="100%" justifyContent="space-between" mb="50px">
      <LogoAndTokens isPageLoading={isPageLoading} />
      <WalletAndChainsActions isPageLoading={isPageLoading} />
    </Flex>
  );
}
