import { ContentContainer } from "../../Content/ContentContainer";
import { TokensList } from "../../Tokens/TokensList";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { useTokens } from "@/hooks/useTokens";
import { useAppStateContext } from "@/context/AppStateContext";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { SelectedToken } from "@/types/tokens";
import { approveTokensList } from "@/lib/actions/tokenApprovals";
import { getAggregatorContractAddress } from "@/lib/utils";

export const TokensSelection = () => {
  const { address } = useAccount();
  const { selectedNetwork } = useAppStateContext();
  const [isActionButtonDisabled, setIsActionButtonDisabled] = useState(true);

  const { state, updateState, setApprovedTokens, setSelectedTokens } = useAppStateContext();
  const { tokens, isLoading } = useTokens();

  // const {
  //   tokensToBurn,
  //   tokensToSell,
  //   isPending: isTokensCheckPending,
  //   error: tokensCheckError,
  // } = useTokensCheck(tokens);

  // useEffect(() => {
  //   if (tokensCheckError) {
  //     console.error("tokensCheckError", tokensCheckError);
  //   }
  // }, [tokensCheckError]);

  // useEffect(() => {
  //   console.log("tokensToSell", tokensToSell, tokensToBurn);
  // }, [tokensToSell, tokensToBurn]);

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

  // const publicClient = usePublicClient();
  // const handleClick = useCallback(async () => {
  //   const res = await checkTokensHaveMethods(
  //     ["0xCa83b628dF8a9c208d0b7F9ef44E38DAcf28A452", "0xf31b1555cd7c8305bc7b27399f7aee263979d884"],
  //     publicClient as PublicClient
  //   );
  //   console.log("res", res);
  // }, [publicClient]);
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
          <TokensList
            tokens={sessionSelectedTokens}
            isLoading={isLoading}
            onCardSelect={handleCardSelect}
          />
          {/* <Button onClick={handleClick}>Check</Button> */}
        </>
      )}
    </ContentContainer>
  );
};
