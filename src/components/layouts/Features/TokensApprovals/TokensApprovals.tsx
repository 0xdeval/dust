import { useAppStateContext } from "@/context/AppStateContext";
import { ContentContainer } from "../../Content/ContentContainer";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { useCallback, useMemo } from "react";
import { TokensStatusesCardsList } from "../../Tokens/TokensStatusesList";
import { mapTokensWithApprovalStatus } from "@/utils/utils";

export const TokensApprovals = () => {
  const { state, selectedTokens, approvedTokens, updateState, setIsReadyToSell } =
    useAppStateContext();

  const selectedTokensWithAppproveStatuses = useMemo(() => {
    console.log("Selected Tokens:", selectedTokens);
    console.log("Approved Tokens:", approvedTokens);
    const mappedTokens = mapTokensWithApprovalStatus(selectedTokens, approvedTokens);
    console.log("Mapped Tokens Result:", mappedTokens);
    return mappedTokens;
  }, [selectedTokens, approvedTokens]);

  const isAllTokensApproved = useMemo(() => {
    return selectedTokens.length === approvedTokens.length;
  }, [selectedTokens, approvedTokens]);

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
