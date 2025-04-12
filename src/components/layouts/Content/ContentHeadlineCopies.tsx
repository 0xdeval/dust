import type { FlexProps } from "@chakra-ui/react";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { forwardRef } from "react";

interface ContentHeadlineCopiesProps extends FlexProps {
  title: string;
  subtitle: string;
}

export const ContentHeadlineCopies = forwardRef<HTMLDivElement, ContentHeadlineCopiesProps>(
  ({ title, subtitle, ...props }, ref) => {
    return (
      <Flex ref={ref} flexDirection="column" {...props}>
        <Heading as="h1" size="4xl" fontWeight="bold">
          {title}
        </Heading>
        <Text color="textSecondary">{subtitle}</Text>
      </Flex>
    );
  }
);

ContentHeadlineCopies.displayName = "ContentHeadlineCopies";
