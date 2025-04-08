import { Flex, FlexProps } from "@chakra-ui/react";
import { forwardRef } from "react";

interface ContentContainerProps extends FlexProps {
  children: React.ReactNode;
}

export const ContentContainer = forwardRef<HTMLDivElement, ContentContainerProps>(
  ({ children, ...props }, ref) => {
    return (
      <Flex
        ref={ref}
        flexDirection="column"
        p="60px 85px"
        border="1px solid"
        borderColor="primaryBorder"
        borderRadius="12px"
        justifyContent="flex-start"
        alignItems="flex-start"
        bg="bgSurface"
        gap="60px"
        {...props}
      >
        {children}
      </Flex>
    );
  }
);

ContentContainer.displayName = "ContentContainer";
