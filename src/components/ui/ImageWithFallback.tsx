import { Image, ImageProps, Icon } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";
import { forwardRef } from "react";

interface ImageWithFallbackProps extends ImageProps {
  srcUrl?: string;
}

export const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ srcUrl, alt, w = "20px", h = "20px", ...props }, ref) => {
    return srcUrl ? (
      <Image ref={ref} src={srcUrl} alt={alt} w={w} h={h} {...props} />
    ) : (
      <Icon as={FaCircle} w={w} h={h} />
    );
  }
);

ImageWithFallback.displayName = "ImageWithFallback";
