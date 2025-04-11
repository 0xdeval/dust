import { useAppStateContext } from "@/context/AppStateContext";
import { ContentContainer } from "../../Content/ContentContainer";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { useCallback, useMemo } from "react";
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

  const handleActionButtonClick = useCallback(() => {
    setIsReadyToSell(true);
    updateState("SELL_TOKENS");
  }, [setIsReadyToSell, updateState]);

  const handelSecondaryButtonClick = useCallback(() => {
    updateState("SELECT_TOKENS");
  }, [updateState]);

  return (
    <ContentContainer isLoading={!state}>
      {state && (
        <>
          <ContentHeadline
            title={state?.contentHeadline}
            subtitle={state?.contentSubtitle}
            buttonLabel={state?.contentButtonLabel}
            buttonAction={handleActionButtonClick}
            isButtonDisabled={!isAllTokensApproved}
            secondaryButtonLabel="Back"
            secondaryButtonAction={handelSecondaryButtonClick}
            isSecondaryButtonDisabled={false}
          />
          <TokensStatusesCardsList selectedTokens={selectedTokensWithAppproveStatuses} />
        </>
      )}
    </ContentContainer>
  );
};
