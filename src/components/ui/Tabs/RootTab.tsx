import { Tabs as ChakraTabs } from "@chakra-ui/react";
import * as React from "react";

type TabsVariant = "enclosed" | "outline" | "line" | "subtle" | "plain";

interface TabsProps {
  variant?: TabsVariant;
  defaultValue?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const TabsComponent = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(props, ref) {
  const {
    variant = "enclosed",
    defaultValue = "members",
    children,
    disabled = false,
    ...rest
  } = props;

  return (
    <ChakraTabs.Root ref={ref} width="100%" defaultValue={defaultValue} variant={variant} {...rest}>
      <div
        style={disabled ? { pointerEvents: "none", opacity: 0.5, userSelect: "none" } : undefined}
      >
        {children}
      </div>
    </ChakraTabs.Root>
  );
});

TabsComponent.displayName = "Tabs";

export const Tabs = Object.assign(TabsComponent, {
  List: ChakraTabs.List,
  Trigger: ChakraTabs.Trigger,
  Content: ChakraTabs.Content,
});
