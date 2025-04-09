import { useAppStateContext } from "@/context/AppStateContext";
import { ContentContainer } from "../../Content/ContentContainer";
import { Skeleton } from "@chakra-ui/react";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { useMemo } from "react";
import { TokensStatusesCardsList } from "../../Tokens/TokensStatusesList";
import { mapTokensWithApprovalStatus } from "@/lib/utils";

export const TokensApprovals = () => {
  const { state, selectedTokens, approvedTokens, updateState, setIsReadyToSell } =
    useAppStateContext();

  const selectedTokensWithAppproveStatuses = useMemo(() => {
    return mapTokensWithApprovalStatus(selectedTokens, approvedTokens);
  }, [selectedTokens, approvedTokens]);

  const isAllTokensApproved = useMemo(() => {
    return selectedTokens.length === approvedTokens.length;
  }, [selectedTokens, approvedTokens]);

  console.log("SELECTED TOKENS WITH APPROVE STATUSES: ", selectedTokensWithAppproveStatuses);

  const handleActionButtonClick = () => {
    setIsReadyToSell(true);
    updateState("SELL_TOKENS");
  };

  return (
    <Skeleton loading={!state}>
      <ContentContainer>
        {state && (
          <>
            <ContentHeadline
              title={state?.contentHeadline}
              subtitle={state?.contentSubtitle}
              buttonLabel={state?.contentButtonLabel}
              buttonAction={handleActionButtonClick}
              isButtonDisabled={!isAllTokensApproved}
            />
            <TokensStatusesCardsList selectedTokens={selectedTokensWithAppproveStatuses} />
          </>
        )}
      </ContentContainer>
    </Skeleton>
  );
};
