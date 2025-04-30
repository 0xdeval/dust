import { ContentContainer } from "@/layouts/Content/ContentContainer";
import { TokensList } from "@/layouts/Tokens/TokensList";
import { ContentHeadline } from "@/layouts/Content/ContentHeadline";
import { useTokens } from "@/hooks/useTokens";
import { useAppStateContext } from "@/context/AppStateContext";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { SelectedToken, Token } from "@/types/tokens";
import { approveTokensList } from "@/utils/actions/tokenApprovals";
import { getAggregatorContractAddress, getStatusText } from "@/utils/utils";
import { Tabs } from "@/ui/Tabs";
import { useTokensCheck } from "@/hooks/useTokensCheck";
import { NoTokensStub } from "@/ui/Stubs/NoTokens";
import { Flex } from "@chakra-ui/react";
import { StatusWithText } from "@/layouts/Status/StatusWithText";

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

  useEffect(() => {
    const initialSelectedTokens = tokens.map((token) => ({
      ...token,
      isSelected: false,
    }));
    setSessionSelectedTokens(initialSelectedTokens);
  }, [tokens, selectedNetwork]);

  const handleCardSelect = useCallback((token: SelectedToken) => {
    setSessionSelectedTokens((prev) =>
      prev.map((t) => (t.address === token.address ? { ...t, isSelected: !t.isSelected } : t))
    );
  }, []);

  // Update action button state based on selected token
  useEffect(() => {
    const selectedTokens = sessionSelectedTokens.filter((t) => t.isSelected);
    setIsActionButtonDisabled(selectedTokens.length === 0);
  }, [sessionSelectedTokens]);

  const handleActionButtonClick = useCallback(async () => {
    const selectedTokens = sessionSelectedTokens.filter((t) => t.isSelected);
    setSelectedTokens(selectedTokens);
    updateState("APPROVE_TOKENS");
    await approveTokensList(
      setApprovedTokens,
      selectedTokens,
      address as `0x${string}`,
      getAggregatorContractAddress(selectedNetwork.id)
    );
  }, [
    setApprovedTokens,
    setSelectedTokens,
    address,
    sessionSelectedTokens,
    updateState,
    selectedNetwork,
  ]);

  const resetSelectedTokens = useCallback(() => {
    setSessionSelectedTokens((prev) => prev.map((token) => ({ ...token, isSelected: false })));
  }, []);

  const handleSellClick = useCallback(() => {
    setOperationType("sell");
    resetSelectedTokens();
  }, [setOperationType, resetSelectedTokens]);

  const handleBurnClick = useCallback(() => {
    setOperationType("burn");
    resetSelectedTokens();
  }, [setOperationType, resetSelectedTokens]);

  const renderTokensList = useCallback(
    (tokens: Array<Token>) => {
      const currentTabTokens = operationType === "sell" ? tokensToSell : tokensToBurn;
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
        />
      );
    },
    [
      sessionSelectedTokens,
      isFetchingTokens,
      handleCardSelect,
      operationType,
      tokensToSell,
      tokensToBurn,
      isTokensCheckPending,
    ]
  );

  return (
    <ContentContainer isLoading={!state}>
      {state && (
        <>
          <ContentHeadline
            title={state?.contentHeadline}
            subtitle={state?.contentSubtitle}
            buttonLabel={state?.contentButtonLabel}
            buttonAction={handleActionButtonClick}
            isButtonDisabled={isActionButtonDisabled}
          />
          <Tabs defaultValue={operationType} variant="enclosed">
            <Flex flexDir="row" justifyContent="space-between" alignItems="center">
              <Tabs.List>
                <Tabs.Trigger
                  value="sell"
                  disabled={tokensToSell.length === 0}
                  onClick={handleSellClick}
                >
                  Sellable tokens
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="burn"
                  disabled={tokensToBurn.length === 0}
                  onClick={handleBurnClick}
                >
                  Burnable tokens
                </Tabs.Trigger>
              </Tabs.List>
              <StatusWithText
                isLoading={isTokensCheckPending}
                text={getStatusText(isFetchingTokens, isTokensCheckPending)}
              />
            </Flex>
            <Tabs.Content value={operationType}>
              {renderTokensList(operationType === "sell" ? tokensToSell : tokensToBurn)}
            </Tabs.Content>
          </Tabs>
        </>
      )}
    </ContentContainer>
  );
};
