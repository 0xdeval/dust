import { ContentContainer } from "@/layouts/Content/ContentContainer";
import { TokensList } from "@/layouts/Tokens/TokensList";
import { ContentHeadline } from "@/layouts/Content/ContentHeadline";
import { useTokens } from "@/hooks/useTokens";
import { useAppStateContext } from "@/context/AppStateContext";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { approveTokensList } from "@/utils/actions/tokenApprovals";
import { getAggregatorContractAddress, prepareTokensSellingIssueCopies } from "@/utils/utils";
import { useTokensCheck } from "@/hooks/useTokensCheck";
import { NoTokensStub } from "@/ui/Stubs/NoTokens";
import { DefaultPopup } from "@/layouts/Popup/DefaultPopup";
import { useOdosQuote } from "@/hooks/useOdosQuote";
import type { SelectedToken, Token } from "@/types/tokens";
import { ContentTabs } from "@/layouts/Content/ContentTabs/ContentTabs";
import { Banner } from "@/components/ui/Banner";
import { Flex } from "@chakra-ui/react";

export const TokensSelection = () => {
  const { address } = useAccount();
  const { selectedNetwork } = useAppStateContext();
  const [isActionButtonDisabled, setIsActionButtonDisabled] = useState(true);

  const {
    state,
    updateState,
    setApprovedTokens,
    setSelectedTokens,
    setOperationType,
    operationType,
  } = useAppStateContext();
  const { tokens, isLoading: isFetchingTokens } = useTokens();
  const { tokensToBurn, tokensToSell, isPending: isTokensCheckPending } = useTokensCheck(tokens);
  const [sessionSelectedTokens, setSessionSelectedTokens] = useState<Array<SelectedToken>>([]);

  const selectedCount = sessionSelectedTokens.filter((t) => t.isSelected).length;
  const showLimitBanner = operationType === "sell" && selectedCount >= 6;

  const {
    quote,
    unsellableTokens,
    sellableTokens,
    setTokensToCheck,
    setToCheckQuote,
    isQuoteLoading,
  } = useOdosQuote();

  useEffect(() => {
    const initialSelectedTokens = tokens.map((token) => ({
      ...token,
      isSelected: false,
    }));
    setSessionSelectedTokens(initialSelectedTokens);
  }, [tokens, selectedNetwork]);

  const handleCardSelect = useCallback(
    (token: SelectedToken) => {
      setSessionSelectedTokens((prev) => {
        const selectedCount = prev.filter((t) => t.isSelected).length;
        const isCurrentlySelected = prev.find((t) => t.address === token.address)?.isSelected;

        // Allow deselection
        if (isCurrentlySelected) {
          return prev.map((t) => (t.address === token.address ? { ...t, isSelected: false } : t));
        }

        // Prevent selecting more than 6, and highlight the banner
        if (operationType === "sell" && selectedCount >= 6) {
          return prev;
        }

        // Otherwise, select the token
        return prev.map((t) => (t.address === token.address ? { ...t, isSelected: true } : t));
      });
    },
    [operationType]
  );

  const selectedTokens = useMemo(
    () => sessionSelectedTokens.filter((t) => t.isSelected),
    [sessionSelectedTokens]
  );

  useEffect(() => {
    setIsActionButtonDisabled(selectedTokens.length === 0);
  }, [selectedTokens]);

  const handleActionButtonClick = useCallback(async () => {
    setTokensToCheck(selectedTokens);
    setToCheckQuote(true);
  }, [selectedTokens, setTokensToCheck, setToCheckQuote]);

  const tokensToApprove = useMemo(
    () => selectedTokens.filter((t) => !unsellableTokens.some((u) => u.address === t.address)),
    [selectedTokens, unsellableTokens]
  );

  const approveTokensHandler = useCallback(async () => {
    setSelectedTokens(tokensToApprove);
    updateState("APPROVE_TOKENS");
    await approveTokensList(
      setApprovedTokens,
      tokensToApprove,
      address as `0x${string}`,
      getAggregatorContractAddress(selectedNetwork.id)
    );
  }, [
    setApprovedTokens,
    tokensToApprove,
    address,
    selectedNetwork,
    setSelectedTokens,
    updateState,
  ]);

  useEffect(() => {
    if (quote) {
      approveTokensHandler();
    }
  }, [quote, approveTokensHandler]);

  const resetSelectedTokens = useCallback(() => {
    setSessionSelectedTokens((prev) => prev.map((token) => ({ ...token, isSelected: false })));
  }, []);

  const handleSellClickTab = useCallback(() => {
    setOperationType("sell");
    resetSelectedTokens();
  }, [setOperationType, resetSelectedTokens]);

  const handleBurnClickTab = useCallback(() => {
    setOperationType("burn");
    resetSelectedTokens();
  }, [setOperationType, resetSelectedTokens]);

  const currentTabTokens = useMemo(
    () => (operationType === "sell" ? tokensToSell : tokensToBurn),
    [operationType, tokensToSell, tokensToBurn]
  );

  const renderTokensList = useCallback(
    (tokens: Array<Token>) => {
      const currentTabTokenAddresses = new Set(
        currentTabTokens.map((t) => t.address.toLowerCase())
      );

      const tokensWithSelection = tokens.map((token) => ({
        ...token,
        isSelected:
          currentTabTokenAddresses.has(token.address.toLowerCase()) &&
          sessionSelectedTokens.some(
            (t) => t.address.toLowerCase() === token.address.toLowerCase() && t.isSelected
          ),
      }));

      if (tokensWithSelection.length === 0 && !isFetchingTokens && !isTokensCheckPending) {
        return <NoTokensStub />;
      }

      return (
        <TokensList
          tokens={tokensWithSelection}
          isLoading={isFetchingTokens || tokensWithSelection.length === 0}
          onCardSelect={handleCardSelect}
          isDisabled={isQuoteLoading}
          disableUnselected={showLimitBanner}
        />
      );
    },
    [
      sessionSelectedTokens,
      isFetchingTokens,
      handleCardSelect,
      currentTabTokens,
      isTokensCheckPending,
      isQuoteLoading,
      showLimitBanner,
    ]
  );

  const popupContent = useMemo(() => {
    if (!quote && unsellableTokens.length > 0) {
      return (
        <DefaultPopup
          isOpen={true}
          title="Some tokens are not sellable"
          subtitle={prepareTokensSellingIssueCopies(sellableTokens, unsellableTokens)}
          buttonCta="Sell rest"
          buttonHandler={approveTokensHandler}
        />
      );
    }
    return null;
  }, [quote, unsellableTokens, sellableTokens, approveTokensHandler]);

  return (
    <ContentContainer isLoading={!state}>
      {state && (
        <>
          {popupContent}
          <ContentHeadline
            title={state?.contentHeadline}
            subtitle={state?.contentSubtitle}
            buttonLabel={operationType === "sell" ? state?.contentButtonLabel : "Soon..."}
            buttonAction={
              operationType === "sell"
                ? quote
                  ? approveTokensHandler
                  : handleActionButtonClick
                : undefined
            }
            isButtonDisabled={isActionButtonDisabled || isQuoteLoading}
            showSpinner={isQuoteLoading}
            loadingText={isQuoteLoading ? "Fetching quote..." : undefined}
          />
          <Flex flexDirection="column" width="100%">
            {showLimitBanner && (
              <Banner type="warning" mb={4}>
                You can select up to 6 tokens to sell at once. Deselect a token to select another
              </Banner>
            )}
            <ContentTabs
              operationType={operationType}
              tokensToSell={tokensToSell}
              tokensToBurn={tokensToBurn}
              isQuoteLoading={isQuoteLoading}
              isTokensCheckPending={isTokensCheckPending}
              isFetchingTokens={isFetchingTokens}
              handleSellClickTab={handleSellClickTab}
              handleBurnClickTab={handleBurnClickTab}
              renderTokensList={renderTokensList}
            />
          </Flex>
        </>
      )}
    </ContentContainer>
  );
};
