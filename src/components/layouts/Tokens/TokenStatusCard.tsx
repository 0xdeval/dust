import { ImageWithFallback } from "@/ui/ImageWithFallback";
import { StatusSpinner } from "@/ui/Spinner";
import { truncateText } from "@/utils/utils";
import type { CardRootProps } from "@chakra-ui/react";
import { Card, Text, Flex, Box, useBreakpointValue } from "@chakra-ui/react";
import * as React from "react";

interface TokenStatusCardProps extends CardRootProps {
  symbol: string;
  balance?: string;
  logoUrl?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  addon?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  onAction?: () => void;
}

export const TokenStatusCard = React.forwardRef<HTMLDivElement, TokenStatusCardProps>(
  function TokenStatusCard(props, ref) {
    const {
      symbol,
      balance,
      logoUrl,
      label,
      description,
      addon,
      footer,
      onAction,
      isLoading = false,
      ...rest
    } = props;

    const isMobile = useBreakpointValue({ base: true, md: false });

    const truncateSize = isMobile ? 20 : 35;

    return (
      <>
        <Card.Root ref={ref} variant="outline" {...rest}>
          <Card.Body>
            <Flex
              flexDirection={{ base: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ base: "flex-start", md: "center" }}
              gap={{ base: 4, md: 2 }}
            >
              <Flex gap={2} w={{ base: "100%", md: "auto" }}>
                <Flex alignItems="center" gap={2}>
                  <ImageWithFallback srcUrl={logoUrl} alt={symbol} borderRadius="50%" />
                </Flex>
                <Flex w="100%" flexDirection="row" justifyContent="space-between">
                  <Flex
                    justifyContent="flex-start"
                    alignItems={{ base: "flex-start", md: "center" }}
                    gap={{ base: 1, md: 2 }}
                    flexDirection={{ base: "column", md: "row" }}
                  >
                    <Text fontWeight="bold">
                      {typeof label === "string"
                        ? truncateText(label, truncateSize)
                        : typeof symbol === "string"
                          ? truncateText(symbol, truncateSize)
                          : symbol}
                    </Text>
                    {description && (
                      <Text fontSize="sm" color="gray.500">
                        {typeof description === "string"
                          ? truncateText(description, truncateSize)
                          : description}
                      </Text>
                    )}
                  </Flex>
                  <Box display={{ base: "block", md: "none" }}>
                    <StatusSpinner isLoading={isLoading} size="lg" />
                  </Box>
                </Flex>
              </Flex>

              <Flex justifyContent="flex-end" gap={2}>
                {addon}
                <Box display={{ base: "none", md: "block" }}>
                  <StatusSpinner isLoading={isLoading} size="lg" />
                </Box>
              </Flex>
            </Flex>
          </Card.Body>
        </Card.Root>
      </>
    );
  }
);
