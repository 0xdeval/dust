import dotenv from "dotenv";
import { defineNetworksConfig } from "@/configs/networks";
import type { SupportedChain } from "@/types/networks";

dotenv.config();

interface AppConfigProps {
  useMocks: boolean;
  blockscoutApiKey: string;
  supportLink: string;
  graphApiKey: string;
  networks: Array<SupportedChain>;
  odosPartnerKey: number;
}

export const appConfig: AppConfigProps = {
  useMocks: Boolean(process.env.NEXT_PUBLIC_USE_MOCKS),
  blockscoutApiKey: process.env.BLOCKSCOUT_API_KEY || "",
  supportLink: process.env.NEXT_PUBLIC_SUPPORT_LINK || "",
  graphApiKey: process.env.NEXT_PUBLIC_THEGRAPH_API_KEY || "",
  odosPartnerKey: parseInt(process.env.NEXT_PUBLIC_PARTNER_CODE || "0") || 0,
  networks: await defineNetworksConfig(),
};
