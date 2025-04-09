import { Skeleton } from "@chakra-ui/react";
import { ContentContainer } from "../../Content/ContentContainer";
import { TokensList } from "../../Tokens/TokensList";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { useTokens } from "@/hooks/useTokens";
import { useAppStateContext } from "@/context/AppStateContext";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { SelectedToken } from "@/types/tokens";
import { AGGREGATOR_CONTRACT_ADDRESS } from "@/lib/constants";
import { approveTokensList } from "@/lib/actions/tokenApprovals";

export const TokensSelection = () => {
  const { address, isConnected } = useAccount();

  const [isActionButtonDisabled, setIsActionButtonDisabled] = useState(true);

  const { state, updateState, setApprovedTokens, setSelectedTokens } = useAppStateContext();
  const { tokens, isLoading } = useTokens();

  const initialSelectedTokens = useMemo(() => {
    return tokens.reduce((acc, token) => {
      return [
        ...acc,
        {
          ...token,
          isSelected: false,
        },
      ];
    }, [] as Array<SelectedToken>);
  }, [tokens, isConnected]);

  const [sessionSelectedTokens, setSessionSelectedTokens] =
    useState<Array<SelectedToken>>(initialSelectedTokens);

  useEffect(() => {
    setSessionSelectedTokens(initialSelectedTokens);
  }, [initialSelectedTokens]);

  const handleCardSelect = (token: SelectedToken) => {
    console.log("token selected", token);
    setSessionSelectedTokens((prev) =>
      prev.map((t) => (t.address === token.address ? { ...t, isSelected: !t.isSelected } : t))
    );
  };

  useEffect(() => {
    const selectedTokens = sessionSelectedTokens.filter((t) => t.isSelected);
    console.log("sessionSelectedTokens", selectedTokens.length);
    setIsActionButtonDisabled(selectedTokens.length === 0);
  }, [sessionSelectedTokens]);

  const handleActionButtonClick = async () => {
    const selectedTokens = sessionSelectedTokens.filter((t) => t.isSelected);

    setSelectedTokens(selectedTokens);
    updateState("APPROVE_TOKENS");
    await approveTokensList(
      setApprovedTokens,
      selectedTokens,
      address as `0x${string}`,
      AGGREGATOR_CONTRACT_ADDRESS
    );
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
              isButtonDisabled={isActionButtonDisabled}
            />
            <TokensList
              tokens={sessionSelectedTokens}
              isLoading={isLoading}
              onCardSelect={handleCardSelect}
            />
          </>
        )}
      </ContentContainer>
    </Skeleton>
  );
};
