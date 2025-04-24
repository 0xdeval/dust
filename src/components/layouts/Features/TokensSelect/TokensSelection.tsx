import { ContentContainer } from "../../Content/ContentContainer";
import { TokensList } from "../../Tokens/TokensList";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { useTokens } from "@/hooks/useTokens";
import { useAppStateContext } from "@/context/AppStateContext";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { SelectedToken, Token } from "@/types/tokens";
import { approveTokensList } from "@/utils/actions/tokenApprovals";
import { getAggregatorContractAddress } from "@/utils/utils";
import { Tabs } from "@/components/ui/Tabs";
import { useTokensCheck } from "@/hooks/useTokensCheck";
import { NoTokensStub } from "@/components/ui/Stubs/NoTokens";

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
  const { tokens, isLoading } = useTokens();

  const { tokensToBurn, tokensToSell, isPending: isTokensCheckPending } = useTokensCheck(tokens);

  console.log("tokensToSell", tokensToSell);
  console.log("tokensToBurn", tokensToBurn);
  console.log("tokens", tokens);
  console.log("isTokensCheckPending", isTokensCheckPending);

  useEffect(() => {
    const initialSelectedTokens = tokens.map((token) => ({
      ...token,
      isSelected: false,
    }));
    setSessionSelectedTokens(initialSelectedTokens);
  }, [tokens, selectedNetwork]);

  const [sessionSelectedTokens, setSessionSelectedTokens] = useState<Array<SelectedToken>>([]);

  const handleCardSelect = useCallback((token: SelectedToken) => {
    console.log("token selected", token);
    setSessionSelectedTokens((prev) =>
      prev.map((t) => (t.address === token.address ? { ...t, isSelected: !t.isSelected } : t))
    );
  }, []);

  useEffect(() => {
    const selectedTokens = sessionSelectedTokens.filter((t) => t.isSelected);
    console.log("sessionSelectedTokens", selectedTokens.length);
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

  const handleSellClick = useCallback(() => {
    setOperationType("sell");
  }, [setOperationType]);

  const handleBurnClick = useCallback(() => {
    setOperationType("burn");
  }, [setOperationType]);

  const renderTokensList = (tokens: Array<Token>) => {
    const tokensWithSelection = tokens.map((token) => ({
      ...token,
      isSelected: sessionSelectedTokens.some((t) => t.address === token.address && t.isSelected),
    }));

    console.log("state: ", isLoading, isTokensCheckPending);

    return (
      <TokensList
        tokens={tokensWithSelection}
        isLoading={isLoading || isTokensCheckPending}
        onCardSelect={handleCardSelect}
      />
    );
  };

  return (
    <ContentContainer isLoading={!state}>
      {state && (
        <>
          {!isTokensCheckPending &&
          !isLoading &&
          tokens.length === 0 &&
          tokensToSell.length === 0 &&
          tokensToBurn.length === 0 ? (
            <NoTokensStub />
          ) : (
            <>
              <ContentHeadline
                title={state?.contentHeadline}
                subtitle={state?.contentSubtitle}
                buttonLabel={operationType === "sell" ? state?.contentButtonLabel : "Soon..."}
                buttonAction={operationType === "sell" ? handleActionButtonClick : undefined}
                isButtonDisabled={operationType === "sell" ? isActionButtonDisabled : true}
              />

              <Tabs defaultValue="sellable" variant="enclosed">
                <Tabs.List>
                  <Tabs.Trigger
                    value="sellable"
                    disabled={tokensToSell.length === 0}
                    onClick={handleSellClick}
                  >
                    Sellable tokens
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="burnable"
                    disabled={tokensToBurn.length === 0}
                    onClick={handleBurnClick}
                  >
                    Burnable tokens
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="sellable">{renderTokensList(tokensToSell)}</Tabs.Content>
                <Tabs.Content value="burnable">{renderTokensList(tokensToBurn)}</Tabs.Content>
              </Tabs>
            </>
          )}
        </>
      )}
    </ContentContainer>
  );
};
