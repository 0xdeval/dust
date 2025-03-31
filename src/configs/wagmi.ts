import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { AppKitNetwork, sepolia } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");

export const networks: AppKitNetwork[] = [sepolia];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: networks as AppKitNetwork[],
});

export const config = wagmiAdapter.wagmiConfig;
