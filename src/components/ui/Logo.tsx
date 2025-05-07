"use client";

import { Image, Box, Skeleton } from "@chakra-ui/react";
import { useColorMode } from "@/ui/ColorMode";
import { useEffect } from "react";
import { useState } from "react";

interface Props {
  logoSrcLightPath: string;
  logoSrcDarkPath?: string;
}

export const Logo = ({ logoSrcLightPath, logoSrcDarkPath }: Props) => {
  const { colorMode } = useColorMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 1000);
  }, []);

  if (!isMounted) {
    return <Skeleton height="70px" width="100%" />;
  }

  const logoSrc = colorMode === "light" ? logoSrcLightPath : logoSrcDarkPath;

  return (
    <Box height="70px" position="relative">
      <Image src={logoSrc} alt="logo" height="70px" objectFit="contain" />
    </Box>
  );
};
