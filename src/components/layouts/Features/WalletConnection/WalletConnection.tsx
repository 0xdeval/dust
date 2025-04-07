import { Skeleton } from "@chakra-ui/react";
import { ContentContainer } from "../../Content/ContentContainer";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { modal } from "@/context/WagmiContext";
import { useAppStateContext } from "@/context/AppStateContext";
import { useEffect } from "react";
import { useAccount } from "wagmi";
export const WalletConnection = () => {
  const { isConnected } = useAccount();
  const { state, updateState } = useAppStateContext();

  useEffect(() => {
    if (isConnected && state?.phase === "CONNECT_WALLET") {
      updateState("SELECT_TOKENS");
    }
  }, [state, isConnected]);

  return (
    <Skeleton loading={!state}>
      <ContentContainer>
        {state && (
          <>
            <ContentHeadline
              title={state?.contentHeadline}
              subtitle={state?.contentSubtitle}
              buttonLabel={state?.contentButtonLabel}
              buttonAction={() => modal.open()}
            />
          </>
        )}
      </ContentContainer>
    </Skeleton>
  );
};
