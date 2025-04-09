import { networksConfig } from "@/configs/networks";
import type { SelectRootProps } from "@chakra-ui/react";
import {
  HStack,
  IconButton,
  Portal,
  Select,
  createListCollection,
  useSelectContext,
} from "@chakra-ui/react";
import { forwardRef } from "react";
import NetworkLogo from "./NetworkLogo";
import type { SupportedChain } from "@/types/networks";

interface SelectItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface NetworksSelectorProps extends Omit<SelectRootProps, "collection"> {
  onSelectNetwork: (value: SupportedChain) => void;
  byDefaultNetwork?: number;
}

const SelectTrigger = ({ defaultItem }: { defaultItem: SelectItem }) => {
  const select = useSelectContext();
  const items = select.selectedItems as Array<SelectItem>;

  return (
    <IconButton px="2" variant="outline" size="sm" {...select.getTriggerProps()}>
      <HStack>
        <NetworkLogo
          name={select.hasSelectedItems ? items[0].label : defaultItem.label}
          logoUrl={
            select.hasSelectedItems ? items[0].icon?.toString() : defaultItem.icon?.toString()
          }
        />
        {select.hasSelectedItems ? items[0].label : defaultItem.label}
      </HStack>
    </IconButton>
  );
};

export const NetworksSelector = forwardRef<HTMLDivElement, NetworksSelectorProps>(
  ({ onSelectNetwork, byDefaultNetwork = 1, ...props }, ref) => {
    const networks = networksConfig;

    const defaultNetwork = networks.find((n) => n.id === byDefaultNetwork);

    const networksList = createListCollection({
      items: networks.map((n) => ({
        label: n.name,
        value: n.id.toString(),
        icon: n.logo,
      })),
    });

    const defaultItem = networksList.items.find(
      (n) => n.value === defaultNetwork?.id.toString()
    ) as SelectItem;

    return (
      <Select.Root
        ref={ref}
        positioning={{ sameWidth: false }}
        collection={networksList}
        size={props.size}
        width={props.width}
        defaultValue={[networksList.items[0].value]}
        defaultChecked
        onValueChange={(item) => {
          const network = networks.find((n) => n.name === item.value[0]);
          if (network) {
            onSelectNetwork(network);
          }
        }}
        {...props}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <SelectTrigger defaultItem={defaultItem} />
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content minW="32">
              {networksList.items.map((network) => {
                return (
                  <Select.Item item={network} key={network.value}>
                    <HStack>
                      <NetworkLogo name={network.label} logoUrl={network.icon} />
                      {network.label}
                    </HStack>
                    <Select.ItemIndicator />
                  </Select.Item>
                );
              })}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    );
  }
);

NetworksSelector.displayName = "NetworksSelector";
