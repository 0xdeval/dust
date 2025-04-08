import { Flex, FlexProps, Heading, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { forwardRef } from "react";
import { ContentHeadlineCopies } from "./ContentHeadlineCopies";
interface ContentHeadlineProps extends FlexProps {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  buttonAction?: () => void;
  isButtonDisabled?: boolean;
  hasActionButton?: boolean;
  copiesItemsAlign?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
  copiesJustifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
}

export const ContentHeadline = forwardRef<HTMLDivElement, ContentHeadlineProps>(
  (
    {
      title,
      subtitle,
      buttonLabel,
      buttonAction,
      isButtonDisabled = true,
      hasActionButton = true,
      copiesItemsAlign = "flex-start",
      copiesJustifyContent = "space-between",
      ...props
    },
    ref
  ) => {
    return (
      <Flex
        ref={ref}
        width="100%"
        justifyContent="space-between"
        alignItems="flex-start"
        {...props}
      >
        {/* <Flex flexDirection="column" gap={4}>
          <Heading as="h1" size="4xl">
            {title}
          </Heading>
          <Text color="textSecondary">{subtitle}</Text>
        </Flex> */}
        <ContentHeadlineCopies
          title={title}
          subtitle={subtitle}
          justifyContent={copiesJustifyContent}
          alignItems={copiesItemsAlign}
        />
        {hasActionButton && (
          <Button
            size="lg"
            bg="actionButtonSolid"
            onClick={buttonAction}
            disabled={isButtonDisabled}
          >
            {buttonLabel}
          </Button>
        )}
      </Flex>
    );
  }
);

ContentHeadline.displayName = "ContentHeadline";
