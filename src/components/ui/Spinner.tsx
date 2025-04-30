"use client";

import { Spinner, Icon, chakra, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineDone } from "react-icons/md";
import { MdError } from "react-icons/md";

import { useEffect, useState } from "react";

const MotionBox = motion(chakra.div);

interface CardStatusSpinnerProps {
  isLoading: boolean;
  size: "sm" | "md" | "lg" | "xl" | "xs" | undefined;
  borderWidth?: string;
  boxSize?: string;
  status?: "success" | "error" | "pending" | "idle";
}

export const StatusSpinner = ({
  isLoading,
  size,
  borderWidth = "3px",
  boxSize,
  status = "success",
}: CardStatusSpinnerProps) => {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowCheck(false); // Reset when loading starts
    } else {
      const timeout = setTimeout(() => setShowCheck(true), 500); // match exit animation delay
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  console.log("status", status);
  return (
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width={boxSize || "2rem"}
      height={boxSize || "2rem"}
    >
      <AnimatePresence>
        {isLoading && (
          <MotionBox
            key="spinner"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            position="flex"
            top="0"
            left="0"
            right="0"
            bottom="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner boxSize={boxSize} borderWidth={borderWidth} size={size} />
          </MotionBox>
        )}

        {showCheck && (
          <MotionBox
            key="checkmark"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            position="flex"
            top="0"
            left="0"
            right="0"
            bottom="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {status === "success" && (
              <Icon as={MdOutlineDone} size={size} boxSize={boxSize} color="green.400" />
            )}
            {status === "error" && (
              <Icon as={MdError} size={size} boxSize={boxSize} color="red.400" />
            )}
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
};
