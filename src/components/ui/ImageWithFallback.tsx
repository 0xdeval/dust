import type { ImageProps } from "@chakra-ui/react";
import { Image, Box, Text } from "@chakra-ui/react";
import { forwardRef } from "react";

interface ImageWithFallbackProps extends ImageProps {
  srcUrl?: string;
}

export const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ srcUrl, alt, w = "20px", h = "20px", ...props }, ref) => {
    const firstLetter = alt ? alt.charAt(0).toUpperCase() : "?";

    return srcUrl ? (
      <Image ref={ref} src={srcUrl} alt={alt} w={w} h={h} {...props} />
    ) : (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w={w}
        h={h}
        bg="gray.200"
        borderRadius="full"
      >
        <Text fontSize="sm" fontWeight="bold" color="gray.700">
          {firstLetter}
        </Text>
      </Box>
    );
  }
);

ImageWithFallback.displayName = "ImageWithFallback";
