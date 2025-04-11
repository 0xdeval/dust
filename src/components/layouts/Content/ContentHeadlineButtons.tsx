import { forwardRef } from "react";
import type { FlexProps } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";

interface ContentHeadlineButtonsProps extends FlexProps {
  buttonLabel?: string;
  buttonAction?: () => void;
  isButtonDisabled?: boolean;

  secondaryButtonLabel?: string;
  secondaryButtonAction?: () => void;
  isSecondaryButtonDisabled?: boolean;
}

export const ContentHeadlineButtons = forwardRef<HTMLDivElement, ContentHeadlineButtonsProps>(
  (
    {
      buttonLabel,
      buttonAction,
      isButtonDisabled,
      secondaryButtonLabel,
      secondaryButtonAction,
      isSecondaryButtonDisabled,
      ...flexProps
    },
    ref
  ) => {
    return (
      <Flex ref={ref} {...flexProps}>
        <Button
          size="lg"
          bg="actionButtonSolid"
          _hover={{ bg: "actionButtonSolidHover" }}
          onClick={buttonAction}
          disabled={isButtonDisabled}
        >
          {buttonLabel}
        </Button>
        {secondaryButtonLabel && (
          <Button
            w="100%"
            size="md"
            variant="plain"
            _hover={{ color: "secondaryHover" }}
            onClick={secondaryButtonAction}
            disabled={isSecondaryButtonDisabled}
          >
            {secondaryButtonLabel}
          </Button>
        )}
      </Flex>
    );
  }
);

ContentHeadlineButtons.displayName = "ContentHeadlineButtons";
