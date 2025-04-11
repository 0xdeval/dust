import type { FlexProps } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import { forwardRef, useMemo } from "react";
import { ContentHeadlineCopies } from "./ContentHeadlineCopies";
import { ContentHeadlineButtons } from "./ContentHeadlineButtons";
import { useAppStateContext } from "@/context/AppStateContext";

interface ContentHeadlineProps extends FlexProps {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  buttonAction?: () => void;
  isButtonDisabled?: boolean;
  secondaryButtonLabel?: string;
  secondaryButtonAction?: () => void;
  isSecondaryButtonDisabled?: boolean;
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
      secondaryButtonLabel,
      secondaryButtonAction,
      isSecondaryButtonDisabled,
      hasActionButton = true,
      copiesItemsAlign = "flex-start",
      copiesJustifyContent = "space-between",
      ...props
    },
    ref
  ) => {
    const { phase } = useAppStateContext();

    const isSecondaryButtonAvaialble = useMemo(() => {
      return phase !== "CONNECT_WALLET" && phase !== "SELECT_TOKENS";
    }, [phase]);
    return (
      <Flex
        ref={ref}
        width="100%"
        justifyContent="space-between"
        alignItems="flex-start"
        {...props}
      >
        <ContentHeadlineCopies
          title={title}
          subtitle={subtitle}
          justifyContent={copiesJustifyContent}
          alignItems={copiesItemsAlign}
        />
        {hasActionButton && (
          <ContentHeadlineButtons
            buttonLabel={buttonLabel}
            buttonAction={buttonAction}
            isButtonDisabled={isButtonDisabled}
            secondaryButtonLabel={isSecondaryButtonAvaialble ? secondaryButtonLabel : undefined}
            secondaryButtonAction={isSecondaryButtonAvaialble ? secondaryButtonAction : undefined}
            isSecondaryButtonDisabled={
              isSecondaryButtonAvaialble ? isSecondaryButtonDisabled : undefined
            }
            flexDirection="column"
            gap={2}
          />
        )}
      </Flex>
    );
  }
);

ContentHeadline.displayName = "ContentHeadline";
