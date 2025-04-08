import { StatusSpinner } from "@/components/ui/Spinner";
import type { CardRootProps } from "@chakra-ui/react";
import { Avatar, Card, Text, Flex } from "@chakra-ui/react";
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
            <Flex justifyContent="space-between" alignItems="center">
              <Flex gap={2}>
                <Avatar.Root>
                  <Avatar.Image src={logoUrl} />
                  <Avatar.Fallback name={symbol} />
                </Avatar.Root>
                <Flex justifyContent="flex-start" alignItems="center" gap={2}>
                  <Text fontWeight="bold">{label ?? symbol}</Text>
                  {description && (
                    <Text fontSize="sm" color="gray.500">
                      {description}
                    </Text>
                  )}
                </Flex>
              </Flex>
              <Flex justifyContent="flex-end" gap={2}>
                {addon}
                <StatusSpinner isLoading={isLoading} size="lg" />
              </Flex>
            </Flex>
          </Card.Body>
        </Card.Root>
      </>
    );
  }
);
