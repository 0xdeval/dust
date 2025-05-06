import { CustomLink } from "@/ui/CustomLink";
import { useAppStateContext } from "@/context/AppStateContext";
import { truncateText } from "@/utils/utils";
import {
  Box,
  CheckboxCard as ChakraCheckboxCard,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import * as React from "react";

export interface TokenCardProps extends ChakraCheckboxCard.RootProps {
  icon?: React.ReactElement;
  label?: React.ReactNode;
  description?: React.ReactNode;
  addon?: React.ReactNode;
  indicator?: React.ReactNode | null;
  indicatorPlacement?: "start" | "end" | "inside";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  linkInfo?: string;
  isDisabled?: boolean;
}

export const TokenCard = React.forwardRef<HTMLInputElement, TokenCardProps>(
  function TokenCard(props, ref) {
    const { selectedNetwork } = useAppStateContext();

    const isMobile = useBreakpointValue({ base: true, md: false });

    const truncateSize = isMobile ? 20 : 35;

    const {
      inputProps,
      label,
      description,
      icon,
      addon,
      indicator = <ChakraCheckboxCard.Indicator />,
      indicatorPlacement = "end",
      linkInfo,
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
                <Flex flexDirection="column" gap={1}>
                  {label && (
                    <ChakraCheckboxCard.Label>
                      <CustomLink href={`${selectedNetwork.explorerUrl}/token/${linkInfo}`}>
                        {truncateText(label as string, truncateSize)}
                      </CustomLink>
                    </ChakraCheckboxCard.Label>
                  )}
                  {description && (
                    <ChakraCheckboxCard.Description>
                      {truncateText(description as string, truncateSize)}
                    </ChakraCheckboxCard.Description>
                  )}
                </Flex>
              </Flex>
              <Box display={{ base: "block", md: "none" }}>{addon}</Box>
              {indicatorPlacement === "inside" && indicator}
            </ContentWrapper>
          )}
          <Box display={{ base: "none", md: "block" }}>{addon}</Box>
          {indicatorPlacement === "end" && indicator}
        </ChakraCheckboxCard.Control>
      </ChakraCheckboxCard.Root>
    );
  }
);

export const CheckboxCardIndicator = ChakraCheckboxCard.Indicator;
