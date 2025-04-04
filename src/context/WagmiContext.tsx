"use client";

import React, { ReactNode } from "react";
import { projectId, wagmiAdapter } from "../configs/wagmi";
import { sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

const queryClient = new QueryClient();

if (!projectId) throw new Error("Project ID is not defined");

export const metadata = {
  name: "Dust",
  description: "Make you tokens dust",
  url: "",
  icons: [""],
};

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
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
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
