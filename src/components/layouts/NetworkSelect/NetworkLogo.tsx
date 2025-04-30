import React from "react";

import { ImageWithFallback } from "@/ui/ImageWithFallback";

type Props = {
  name: string | undefined;
  logoUrl: string | undefined;
};

const NetworkLogo = ({ name, logoUrl }: Props) => {
  return <ImageWithFallback bg="white" srcUrl={logoUrl} alt={name} borderRadius="50%" />;
};

export default React.memo(NetworkLogo);
