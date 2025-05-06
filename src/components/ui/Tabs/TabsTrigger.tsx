import type { Token } from "@/types/tokens";
import { Tabs } from "@/ui/Tabs/RootTab";
import type { ReactNode } from "react";

interface Props {
  tokens: Array<Token>;
  value: string;
  isQuoteLoading: boolean;
  handleClickTab: () => void;
  children: ReactNode;
}

export const TabsTrigger = ({ tokens, isQuoteLoading, handleClickTab, value, children }: Props) => {
  return (
    <Tabs.Trigger
      width="100%"
      value={value}
      disabled={tokens.length === 0 || isQuoteLoading}
      onClick={handleClickTab}
    >
      {children}
    </Tabs.Trigger>
  );
};
