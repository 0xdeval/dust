"use client";

import { Image, Box } from "@chakra-ui/react";
import { useColorMode } from "./ColorMode";

interface Props {
  logoSrcDefaultPath: string;
  logoSrcDarkPath?: string;
}

export const Logo = ({ logoSrcDefaultPath, logoSrcDarkPath }: Props) => {
  const { colorMode } = useColorMode();
  const logoSrc = colorMode === "light" ? logoSrcDefaultPath : logoSrcDarkPath;

  return (
    <Box height="70px" position="relative">
      <Image src={logoSrc} alt="logo" height="70px" objectFit="contain" />
    </Box>
  );
};
