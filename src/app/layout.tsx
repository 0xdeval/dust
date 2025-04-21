import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Web3ContextProvider from "@/context/WagmiContext";
import { headers } from "next/headers";
import { CustomChakraProvider } from "@/components/ui/Provider";
import { Header } from "@/components/layouts/Header/Header";
import { NotificationToaster } from "@/components/ui/Toaster";
import { RootContainer } from "@/components/layouts/Container/RootContainer";
import { AppStateProvider } from "@/context/AppStateContext";
import React from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dust",
  description: "Earn money from spam tokens",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Web3ContextProvider cookies={cookies}>
          <AppStateProvider>
            <CustomChakraProvider>
              <RootContainer>
                <Header />
                {children}
                <NotificationToaster />
              </RootContainer>
            </CustomChakraProvider>
          </AppStateProvider>
        </Web3ContextProvider>
      </body>
    </html>
  );
}
