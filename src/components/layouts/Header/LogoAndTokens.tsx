import { Flex } from "@chakra-ui/react";
import { TokenSelector } from "@/ui/TokenSelector";
import { Logo } from "@/ui/Logo";
import { useAppStateContext } from "@/context/AppStateContext";
import { useCallback } from "react";

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

  return (
    <Flex flexDirection="column" gap={2} alignItems="flex-start">
      <Logo logoSrcLightPath="/logo-light.png" logoSrcDarkPath="/logo-dark.png" />
      <Flex justifyContent="flex-start" alignItems="center" gap="10px">
        to <TokenSelector loading={isPageLoading} onSelect={handleReceivedTokenSelect} />
      </Flex>
    </Flex>
  );
};
