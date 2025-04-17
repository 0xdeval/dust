"use client";

import type { DialogContentProps } from "@chakra-ui/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
  Button,
  Text,
  Box,
  PopoverContentProps,
  useDisclosure,
  Dialog,
} from "@chakra-ui/react";
import { forwardRef, useCallback, useEffect } from "react";

type CustomDialogProps = DialogContentProps & {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  buttonCta: string;
  buttonHandler: () => void;
  placement?: "top" | "bottom" | "center";
};

export const DefaultPopup = forwardRef<HTMLDivElement, CustomDialogProps>(
  (
    { isOpen, title, subtitle, buttonCta, buttonHandler, placement = "center", ...popoverProps },
    ref
  ) => {
    const { open, onOpen, onClose } = useDisclosure();

    useEffect(() => {
      if (isOpen) {
        onOpen();
      } else {
        onClose();
      }
    }, [isOpen, onOpen, onClose]);

    const handleButtonClick = useCallback(() => {
      buttonHandler();
      onClose();
    }, [buttonHandler, onClose]);

    return (
      <>
        <Dialog.Root open={open} size="lg" placement={placement} motionPreset="slide-in-bottom">
          <Dialog.Backdrop />
          <Dialog.Positioner ref={ref} {...popoverProps}>
            <Dialog.Content>
              <Dialog.CloseTrigger onClick={onClose} />
              <Dialog.Body>
                <Dialog.Title fontWeight="bold">{title}</Dialog.Title>
                {subtitle && <Text mb={3}>{subtitle}</Text>}
                <Button colorScheme="blue" onClick={handleButtonClick}>
                  {buttonCta}
                </Button>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </>
    );
  }
);

DefaultPopup.displayName = "DefaultPopup";
