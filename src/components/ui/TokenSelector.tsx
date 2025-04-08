"use client";

import { TOKENS_TO_RECEIVE } from "@/lib/constants";
import { Portal, Select, createListCollection } from "@chakra-ui/react";

interface Props {
  onSelect: (value: string[]) => void;
}

export const TokenSelector = ({ onSelect }: Props) => {
  const tokensCollection = createListCollection({
    items: TOKENS_TO_RECEIVE.map((token) => ({
      label: token.symbol,
      value: token.address,
    })),
  });

  return (
    <Select.Root
      collection={tokensCollection}
      variant="outline"
      size="sm"
      width="120px"
      defaultChecked
      defaultValue={[TOKENS_TO_RECEIVE[0].address]}
      onValueChange={(e) => onSelect(e.value)}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Received token" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {tokensCollection.items.map((token) => (
              <Select.Item item={token} key={token.value}>
                {token.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};
