"use client";

import { TOKENS_TO_RECEIVE } from "@/lib/constants";
import type { SelectValueChangeDetails } from "@chakra-ui/react";
import { Portal, Select, createListCollection } from "@chakra-ui/react";
import type { SelectItem } from "@/types/tokens";
import { useCallback } from "react";
interface Props {
  onSelect: (value: Array<string>) => void;
}

export const TokenSelector = ({ onSelect }: Props) => {
  const tokensCollection = createListCollection({
    items: TOKENS_TO_RECEIVE.map((token) => ({
      label: token.symbol,
      value: token.address,
      icon: undefined,
    })),
  });

  const handleValueChange = useCallback(
    (details: SelectValueChangeDetails<SelectItem>) => {
      onSelect(details.value);
    },
    [onSelect]
  );

  return (
    <Select.Root
      collection={tokensCollection}
      variant="outline"
      size="sm"
      width="120px"
      defaultChecked
      defaultValue={[TOKENS_TO_RECEIVE[0].address]}
      onValueChange={handleValueChange}
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
