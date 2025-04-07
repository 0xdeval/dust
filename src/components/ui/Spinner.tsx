import { Icon, Spinner } from "@chakra-ui/react";
import { MdOutlineDone } from "react-icons/md";

import * as React from "react";

interface CardStatusSpinnerProps {
  isLoading: boolean;
  size: "sm" | "md" | "lg" | "xl" | "xs" | undefined;
  borderWidth?: string;
}

export const CardStatusSpinner = ({
  isLoading,
  size,
  borderWidth = "2px",
}: CardStatusSpinnerProps) => {
  if (!isLoading) {
    return (
      <Icon as={MdOutlineDone} color="green.500" fill="green.500" size={size} />
    );
  }

  return (
    <Spinner size={size} borderWidth={borderWidth} color="actionButtonSolid" />
  );
};
