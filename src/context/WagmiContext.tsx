"use client";

import type { ReactNode } from "react";
import React from "react";
import { projectId, wagmiAdapter } from "../configs/wagmi";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { wagmiNetworks } from "@/configs/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
const queryClient = new QueryClient();

if (!projectId) throw new Error("Project ID is not defined");

export const metadata = {
  name: "Dust",
  description: "Make you tokens dust",
  url: "",
  icons: [""],
};

if (!wagmiNetworks || wagmiNetworks.length === 0) {
  throw new Error("No networks available in wagmiNetworks");
}

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: wagmiNetworks as [AppKitNetwork, ...Array<AppKitNetwork>],
  defaultNetwork: wagmiNetworks[0],
  metadata: metadata,
  features: {
    analytics: true,
    email: false,
    socials: [],
    emailShowWallets: false,
  },
});

export default function Web3ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
