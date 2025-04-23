import { Tabs as ChakraTabs } from "@chakra-ui/react";
import * as React from "react";

type TabsVariant = "enclosed" | "outline" | "line" | "subtle" | "plain";

interface TabsProps {
  variant?: TabsVariant;
  defaultValue?: string;
  children: React.ReactNode;
}

const TabsComponent = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(props, ref) {
  const { variant = "enclosed", defaultValue = "members", children, ...rest } = props;

  return (
    <ChakraTabs.Root ref={ref} width="100%" defaultValue={defaultValue} variant={variant} {...rest}>
      {children}
    </ChakraTabs.Root>
  );
});

TabsComponent.displayName = "Tabs";

export const Tabs = Object.assign(TabsComponent, {
  List: ChakraTabs.List,
  Trigger: ChakraTabs.Trigger,
  Content: ChakraTabs.Content,
});
