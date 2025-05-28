import { cookieStorage, type CreateConnectorFn, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { safe } from "wagmi/connectors";
import { wagmiNetworks } from "@/configs/networks";

interface SafeConnectorOptions {
  allowedDomains: Array<RegExp>;
  debug: boolean;
}

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");

const connectors: Array<CreateConnectorFn> = [];
connectors.push(
  safe({
    allowedDomains: [/^.*$/],
    debug: false,
  } as SafeConnectorOptions)
);

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: wagmiNetworks as Array<AppKitNetwork>,
  connectors,
  batch: {
    multicall: true,
  },
});

export const config = wagmiAdapter.wagmiConfig;
