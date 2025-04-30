import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";

import { wagmiNetworks } from "@/configs/networks";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: wagmiNetworks as Array<AppKitNetwork>,
});

export const config = wagmiAdapter.wagmiConfig;
