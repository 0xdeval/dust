import type { Resource } from "@/lib/types/api/resources";

export const RESOURCES: Record<string, Resource> = {
  odos: {
    base: "https://api.odos.xyz",
    quote: {
      path: "/sor/quote/v2",
    },
    execute: {
      path: "/sor/assemble",
    },
  },
};
