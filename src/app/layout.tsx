import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Web3ContextProvider from "@/context/WagmiContext";
import { headers } from "next/headers";
import { CustomChakraProvider } from "@/ui/Provider";
import { Header } from "@/layouts/Header/Header";
import { NotificationToaster } from "@/ui/Toaster";
import { RootContainer } from "@/layouts/Container/RootContainer";
import { AppStateProvider } from "@/context/AppStateContext";
import React from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dust | Dust Off Your Wallet and Earn from Spam Tokens",
  description:
    "Dust is a Web3 tool that converts spam tokens and airdropped scams into real value. Clean up your wallet and get rewarded for crypto dust.",
  keywords: [
    "dust token cleaner",
    "spam token removal",
    "earn from dust",
    "crypto wallet spam",
    "airdropped token scam",
    "wallet hygiene",
    "web3 dust off",
    "remove token spam",
    "dustoff.fun",
    "Dust DApp",
  ],
  metadataBase: new URL("https://dustoff.fun"),
  openGraph: {
    title: "Dust | Dust Off Your Wallet and Earn from Spam Tokens",
    description:
      "Use Dust to turn spam tokens, dust, and junk airdrops into profit. Clean your wallet the smart way — at dustoff.fun.",
    url: "https://dustoff.fun",
    siteName: "Dust",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dust App - Clean up your crypto wallet",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dust | Dust Off Your Wallet and Earn from Spam Tokens",
    description: "Turn your spam tokens into real crypto. Try Dust now at dustoff.fun.",
    images: ["/og-image.png"],
    creator: "@mike_krupin",
  },
  icons: {
    icon: "/favicon.ico",
  },
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
      <body className={inter.className}>
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
