import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Web3ContextProvider from "@/context/WagmiContext";
import { headers } from "next/headers";
import { CustomChakraProvider } from "@/ui/CustomChakraProvider";
import { Header } from "@/layouts/Header/Header";
import { NotificationToaster } from "@/ui/CustomToaster";
import { RootContainer } from "@/layouts/Container/RootContainer";
import { AppStateProvider } from "@/context/AppStateContext";
import React from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dust – Remove spam tokens, secure your wallet",
  description:
    "Dust helps users eliminate spam and scam tokens by offering tools to sell or burn unwanted assets, ensuring a safer and cleaner blockchain experience",
  keywords: [
    "spam tokens",
    "burn tokens",
    "sell unwanted crypto",
    "wallet security",
    "Web3 token cleanup",
    "Dust",
    "crypto wallet hygiene",
    "scam token removal",
    "airdropped spam",
    "dustoff.fun",
  ],
  metadataBase: new URL("https://dustoff.fun"),
  openGraph: {
    title: "Dust – Clean your wallet, secure your crypto",
    description:
      "Eliminate spam and scam tokens from your wallet effortlessly with Dust's sell and burn features",
    url: "https://dustoff.fun",
    siteName: "Dust",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dust – Clean your wallet, secure your crypto",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dust – Remove spam tokens | Secure your web3 wallet",
    description: "Sell or burn unwanted tokens to enhance wallet security and clarity.",
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
