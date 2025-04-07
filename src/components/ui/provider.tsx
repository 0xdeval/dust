"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { type ColorModeProviderProps } from "./ColorMode";
import { ThemeProvider } from "next-themes";
import { system } from "@/configs/theme";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {props.children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
