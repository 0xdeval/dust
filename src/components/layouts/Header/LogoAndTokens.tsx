import { Flex } from "@chakra-ui/react";
import { TokenSelector } from "@/ui/TokenSelector";
import { Logo } from "@/ui/Logo";
import { useAppStateContext } from "@/context/AppStateContext";
import { useCallback } from "react";
import { useColorModeValue } from "@/components/ui/ColorMode";

interface Props {
  isPageLoading: boolean;
}

export const LogoAndTokens = ({ isPageLoading }: Props) => {
  const { setReceivedToken } = useAppStateContext();

  const handleReceivedTokenSelect = useCallback(
    (value: Array<string>) => {
      if (value) {
        setReceivedToken(value[0] as `0x${string}`);
      }
    },
    [setReceivedToken]
  );

  const logoSrc = useColorModeValue("/logo-dark.png", "/logo-light.png");

  return (
    <Flex flexDirection="column" gap={2} alignItems="flex-start">
      <Logo logoSrcDefaultPath={logoSrc} logoSrcDarkPath={logoSrc} />
      <Flex justifyContent="flex-start" alignItems="center" gap="10px">
        to <TokenSelector loading={isPageLoading} onSelect={handleReceivedTokenSelect} />
      </Flex>
    </Flex>
  );
};
