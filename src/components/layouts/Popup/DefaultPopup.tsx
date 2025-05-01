"use client";

import type { DialogContentProps } from "@chakra-ui/react";
import { Button, Text, useDisclosure, Dialog, CloseButton, Portal } from "@chakra-ui/react";
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
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner ref={ref} {...popoverProps}>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>{title}</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>{subtitle && <Text mb={3}>{subtitle}</Text>}</Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </Dialog.ActionTrigger>
                  <Button colorScheme="blue" onClick={handleButtonClick}>
                    {buttonCta}
                  </Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={onClose} />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </>
    );
  }
);

DefaultPopup.displayName = "DefaultPopup";
