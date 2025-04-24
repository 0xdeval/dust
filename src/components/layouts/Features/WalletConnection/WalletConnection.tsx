import { ContentContainer } from "../../Content/ContentContainer";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { modal } from "@/context/WagmiContext";
import { useAppStateContext } from "@/context/AppStateContext";
import { useCallback, useEffect } from "react";
import { useAccount } from "wagmi";

import { FaWallet } from "react-icons/fa";
import { Flex } from "@chakra-ui/react";

export const WalletConnection = () => {
  const { isConnected } = useAccount();
  const { state, updateState } = useAppStateContext();

  useEffect(() => {
    if (isConnected && state?.phase === "CONNECT_WALLET") {
      updateState("SELECT_TOKENS");
    }
  }, [state, isConnected, updateState]);

  const handleButtonAction = useCallback(() => {
    modal.open();
  }, []);

  return (
    <ContentContainer isLoading={!state}>
      {state && (
        <Flex w="100%" flexDirection="column" justifyContent="center" alignItems="center" gap={4}>
          <FaWallet size={100} style={{ objectFit: "contain" }} />
          <ContentHeadline
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            copiesJustifyContent="center"
            copiesItemsAlign="center"
            title={state?.contentHeadline}
            subtitle={state?.contentSubtitle}
            buttonLabel={state?.contentButtonLabel}
            buttonAction={handleButtonAction}
            isButtonDisabled={false}
          />
        </Flex>
      )}
    </ContentContainer>
  );
};
