import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { StatusSpinner } from "@/components/ui/Spinner";
import { truncateText } from "@/lib/utils";
import type { CardRootProps } from "@chakra-ui/react";
import { Card, Text, Flex, Box } from "@chakra-ui/react";
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
  actionLabel?: string;
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
      actionLabel = "Approve",
      ...rest
    } = props;

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
                        ? truncateText(label)
                        : typeof symbol === "string"
                          ? truncateText(symbol)
                          : symbol}
                    </Text>
                    {description && (
                      <Text fontSize="sm" color="gray.500">
                        {typeof description === "string" ? truncateText(description) : description}
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
