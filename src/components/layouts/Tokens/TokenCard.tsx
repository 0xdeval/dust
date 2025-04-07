import { CheckboxCard as ChakraCheckboxCard, Flex } from "@chakra-ui/react";
import * as React from "react";

export interface TokenCardProps extends ChakraCheckboxCard.RootProps {
  icon?: React.ReactElement;
  label?: React.ReactNode;
  description?: React.ReactNode;
  addon?: React.ReactNode;
  indicator?: React.ReactNode | null;
  indicatorPlacement?: "start" | "end" | "inside";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const TokenCard = React.forwardRef<HTMLInputElement, TokenCardProps>(
  function TokenCard(props, ref) {
    const {
      inputProps,
      label,
      description,
      icon,
      addon,
      indicator = <ChakraCheckboxCard.Indicator />,
      indicatorPlacement = "end",
      ...rest
    } = props;

    const hasContent = label || description || icon;
    const ContentWrapper = indicator ? ChakraCheckboxCard.Content : React.Fragment;

    return (
      <ChakraCheckboxCard.Root {...rest}>
        <ChakraCheckboxCard.HiddenInput ref={ref} {...inputProps} />
        <ChakraCheckboxCard.Control>
          {indicatorPlacement === "start" && indicator}
          {hasContent && (
            <ContentWrapper>
              <Flex flexDirection="row" alignItems="center" gap={2}>
                {icon}
                {label && <ChakraCheckboxCard.Label>{label}</ChakraCheckboxCard.Label>}
                {description && (
                  <ChakraCheckboxCard.Description>{description}</ChakraCheckboxCard.Description>
                )}
              </Flex>
              {indicatorPlacement === "inside" && indicator}
            </ContentWrapper>
          )}
          {addon}
          {indicatorPlacement === "end" && indicator}
        </ChakraCheckboxCard.Control>
      </ChakraCheckboxCard.Root>
    );
  }
);

export const CheckboxCardIndicator = ChakraCheckboxCard.Indicator;
