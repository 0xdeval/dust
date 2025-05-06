import type { FlexProps } from "@chakra-ui/react";
import { Flex, Heading, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { forwardRef } from "react";

interface ContentHeadlineCopiesProps extends FlexProps {
  headlineTitle: ReactNode;
  headlineSubtitle: ReactNode;
}

export const ContentHeadlineCopies = forwardRef<HTMLDivElement, ContentHeadlineCopiesProps>(
  ({ headlineTitle, headlineSubtitle, ...props }, ref) => {
    return (
      <Flex ref={ref} flexDirection="column" {...props}>
        <Heading as="h1" size="2xl" fontWeight="bold">
          {headlineTitle}
        </Heading>
        <Text color="textSecondary">{headlineSubtitle}</Text>
      </Flex>
    );
  }
);

ContentHeadlineCopies.displayName = "ContentHeadlineCopies";
