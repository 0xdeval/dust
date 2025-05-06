import { forwardRef } from "react";
import { Box, Flex, Icon } from "@chakra-ui/react";
import { AiFillInfoCircle } from "react-icons/ai";
import { IoWarning } from "react-icons/io5";
import type { FlexProps } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

type BannerType = "info" | "warning" | "error";

const typeConfig: Record<BannerType, { color: string; bg: string; icon: IconType }> = {
  info: {
    color: "blue.700",
    bg: "blue.50",
    icon: AiFillInfoCircle,
  },
  warning: {
    color: "orange.700",
    bg: "orange.50",
    icon: IoWarning,
  },
  error: {
    color: "red.700",
    bg: "red.50",
    icon: IoWarning,
  },
};

export interface BannerProps extends FlexProps {
  type?: BannerType;
  children: ReactNode;
}

export const Banner = forwardRef<HTMLDivElement, BannerProps>(
  ({ type = "info", alignItems = "flex-start", children, ...props }, ref) => {
    const { color, bg, icon } = typeConfig[type];
    return (
      <Flex
        ref={ref}
        alignItems={alignItems}
        flexDirection="row"
        bg={bg}
        color={color}
        p={4}
        borderRadius="md"
        gap={3}
        {...props}
      >
        <Icon as={icon} boxSize={6} />
        <Box flex="1">{children}</Box>
      </Flex>
    );
  }
);

Banner.displayName = "Banner";
