"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { type ColorModeProviderProps } from "@/ui/ColorMode";
import { ThemeProvider } from "next-themes";
import { system } from "@/configs/theme";

export function CustomChakraProvider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {props.children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
