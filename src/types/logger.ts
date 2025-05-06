export interface LoggerOptions {
  address: string | `0x${string}` | undefined;
  selectedNetworkId: string | undefined;
  receivedToken: string | `0x${string}` | undefined;
}

export type LogLevel = "debug" | "info" | "warn" | "error";
