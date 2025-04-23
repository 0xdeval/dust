"use client";

import type { SelectValueChangeDetails } from "@chakra-ui/react";
import { Portal, Select, Skeleton, createListCollection } from "@chakra-ui/react";
import type { SelectItem } from "@/types/tokens";
import { useCallback, useState, useEffect } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { getAllTokensToReceiveForChain, getDefaultTokenToReceive } from "@/utils/utils";

interface Props {
  onSelect: (value: Array<string>) => void;
  loading: boolean;
}

export const TokenSelector = ({ onSelect, loading }: Props) => {
  const { selectedNetwork } = useAppStateContext();
  const [selectedToken, setSelectedToken] = useState<Array<string>>([
    getDefaultTokenToReceive(selectedNetwork.id).address,
  ]);

  const tokensCollection = createListCollection({
    items: getAllTokensToReceiveForChain(selectedNetwork.id).map((token) => ({
      label: token.symbol,
      value: token.address,
      icon: undefined,
    })),
  });

  useEffect(() => {
    setSelectedToken([getDefaultTokenToReceive(selectedNetwork.id).address]);
    onSelect([getDefaultTokenToReceive(selectedNetwork.id).address]);
  }, [selectedNetwork.id, onSelect]);

  const handleValueChange = useCallback(
    (details: SelectValueChangeDetails<SelectItem>) => {
      setSelectedToken(details.value);
      onSelect(details.value);
    },
    [onSelect]
  );

  // console.log(
  //   "Current default value for chain:",
  //   selectedNetwork.id,
  //   getDefaultTokenToReceive(selectedNetwork.id).address,
  //   tokensCollection
  // );
  return (
    <Skeleton loading={loading}>
      <Select.Root
        collection={tokensCollection}
        variant="outline"
        size="sm"
        width="120px"
        value={selectedToken}
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
    </Skeleton>
  );
};
