import type { FlexProps } from "@chakra-ui/react";
import { Flex, Skeleton } from "@chakra-ui/react";
import { forwardRef } from "react";
import React from "react";

interface ContentContainerProps extends FlexProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const ContentContainer = forwardRef<HTMLDivElement, ContentContainerProps>(
  ({ children, isLoading = false, ...props }, ref) => {
    return (
      <Skeleton loading={isLoading} minHeight="50%">
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
      </Skeleton>
    );
  }
);

ContentContainer.displayName = "ContentContainer";
