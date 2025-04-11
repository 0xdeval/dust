import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import {
  AbsoluteCenter,
  Button as ChakraButton,
  Skeleton,
  Span,
  Spinner,
  Box,
} from "@chakra-ui/react";
import * as React from "react";

interface ButtonLoadingProps {
  loading?: boolean;
  loadingText?: React.ReactNode;
  rightIcon?: React.ReactNode | undefined;
}

interface ButtonProps extends ChakraButtonProps, ButtonLoadingProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { disabled, loadingText, children, rightIcon, loading = false, ...rest } = props;
  return (
    <Skeleton loading={loading}>
      <ChakraButton disabled={loading || disabled} ref={ref} {...rest}>
        {loading && !loadingText ? (
          <>
            <AbsoluteCenter display="inline-flex">
              <Spinner size="inherit" color="inherit" />
            </AbsoluteCenter>
            <Span opacity={0}>{children}</Span>
          </>
        ) : loading && loadingText ? (
          <>
            <Spinner size="inherit" color="inherit" />
            {loadingText}
          </>
        ) : (
          <>
            {children}
            {rightIcon && <Box>{rightIcon}</Box>}
          </>
        )}
      </ChakraButton>
    </Skeleton>
  );
});
