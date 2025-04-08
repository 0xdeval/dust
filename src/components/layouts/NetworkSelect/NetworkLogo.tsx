// import React from "react";
// import { mainnet } from "viem/chains";

// import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

// import networks, { EXPLORER_URLS } from "~/config/networks";

// type Props = {
//   id: number | undefined;
// };

// const NetworkLogo = ({ id = 0 }: Props) => {
//   const name = networks.find((n) => n.id === id)?.name;
//   let logoUrls;

//   if (id === mainnet.id) {
//     logoUrls = ["/static/ethereum.svg"];
//   } else {
//     logoUrls = [
//       `${EXPLORER_URLS[id]}/assets/configs/network_icon.svg`,
//       `${EXPLORER_URLS[id]}/assets/network_icon.svg`,
//       `${EXPLORER_URLS[id]}/static/${name?.toLowerCase()}_icon.svg`,
//       `${EXPLORER_URLS[id]}/assets/configs/network_logo_dark.jpg`,
//     ];
//   }

//   return <ImageWithFallback srcUrl={logoUrls} alt={name} />;
// };

// export default React.memo(NetworkLogo);
