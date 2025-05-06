import { Tabs } from "@/ui/Tabs/RootTab";
import { Flex } from "@chakra-ui/react";
import { StatusWithText } from "@/layouts/Status/StatusWithText";
import { getStatusText } from "@/utils/utils";
import type { Token } from "@/types/tokens";
import { TabsTrigger } from "@/ui/Tabs/TabsTrigger";
import type { ReactNode } from "react";

interface Props {
  operationType: string;
  tokensToSell: Array<Token>;
  tokensToBurn: Array<Token>;
  isQuoteLoading: boolean;
  isTokensCheckPending: boolean;
  isFetchingTokens: boolean;
  handleSellClickTab: () => void;
  handleBurnClickTab: () => void;
  renderTokensList: (tokens: Array<Token>) => ReactNode;
}

export const ContentTabs = ({
  operationType,
  tokensToSell,
  tokensToBurn,
  isQuoteLoading,
  isTokensCheckPending,
  isFetchingTokens,
  handleSellClickTab,
  handleBurnClickTab,
  renderTokensList,
}: Props) => {
  return (
    <Tabs defaultValue={operationType} variant="enclosed" disabled={isQuoteLoading}>
      <Flex
        flexDir={{ base: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        gap={2}
        width="100%"
      >
        <Tabs.List width={{ base: "100%", md: "50%" }}>
          <TabsTrigger
            tokens={tokensToSell}
            value="sell"
            isQuoteLoading={isQuoteLoading}
            handleClickTab={handleSellClickTab}
          >
            Sellable tokens
          </TabsTrigger>
          <TabsTrigger
            tokens={tokensToBurn}
            value="burn"
            isQuoteLoading={isQuoteLoading}
            handleClickTab={handleBurnClickTab}
          >
            Burnable tokens
          </TabsTrigger>
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
  );
};
