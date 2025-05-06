import { useAppStateContext } from "@/context/AppStateContext";
import { ContentContainer } from "@/layouts/Content/ContentContainer";
import { ContentHeadline } from "@/layouts/Content/ContentHeadline";
import { useCallback, useMemo } from "react";
import { TokensStatusesCardsList } from "@/layouts/Tokens/TokensStatusesList";
import { mapTokensWithApprovalStatus } from "@/utils/utils";

export const TokensApprovals = () => {
  const { state, selectedTokens, approvedTokens, updateState, setIsReadyToSell } =
    useAppStateContext();

  const selectedTokensWithAppproveStatuses = useMemo(
    () => mapTokensWithApprovalStatus(selectedTokens, approvedTokens),
    [selectedTokens, approvedTokens]
  );

  const isAllTokensApproved = useMemo(
    () => selectedTokens.length > 0 && selectedTokens.length === approvedTokens.length,
    [selectedTokens.length, approvedTokens.length]
  );

  const handleActionButtonClick = useCallback(() => {
    if (isAllTokensApproved) {
      setIsReadyToSell(true);
      updateState("SELL_TOKENS");
    }
  }, [isAllTokensApproved, setIsReadyToSell, updateState]);

  const handleSecondaryButtonClick = useCallback(() => {
    updateState("SELECT_TOKENS");
  }, [updateState]);

  const headlineProps = useMemo(
    () => ({
      title: state?.contentHeadline || "",
      subtitle: state?.contentSubtitle || "",
      buttonLabel: state?.contentButtonLabel || "",
      buttonAction: handleActionButtonClick,
      isButtonDisabled: !isAllTokensApproved,
      secondaryButtonLabel: "Back",
      secondaryButtonAction: handleSecondaryButtonClick,
      isSecondaryButtonDisabled: false,
    }),
    [
      state?.contentHeadline,
      state?.contentSubtitle,
      state?.contentButtonLabel,
      handleActionButtonClick,
      isAllTokensApproved,
      handleSecondaryButtonClick,
    ]
  );

  if (!state) {
    return (
      <ContentContainer isLoading={true}>
        <div />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer isLoading={false}>
      <ContentHeadline {...headlineProps} />
      <TokensStatusesCardsList selectedTokens={selectedTokensWithAppproveStatuses} />
    </ContentContainer>
  );
};
