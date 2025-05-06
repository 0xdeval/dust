import type { LoggerOptions, LogLevel } from "@/types/logger";

/* eslint-disable */
const isDebug =
  typeof window !== "undefined"
    ? (window as unknown as { __DEBUG__: boolean }).__DEBUG__ ||
      process.env.NODE_ENV !== "production"
    : process.env.NODE_ENV !== "production";
/* eslint-enable */

function format(level: LogLevel, source: string, message: string, options?: LoggerOptions) {
  const time = new Date().toISOString();

  const address = options?.address
    ? `[address:${options.address.slice(0, 4)}...${options.address.slice(-4)}]`
    : "-";
  const selectedNetworkId = options?.selectedNetworkId
    ? `[networkId:${options.selectedNetworkId}]`
    : "-";
  const receivedToken = options?.receivedToken
    ? `[receivedToken:${options.receivedToken.slice(0, 4)}...${options.receivedToken.slice(-4)}]`
    : "-";

  const ctx = `${address} ${selectedNetworkId} ${receivedToken}`;

  return `[${time}] [${level.toUpperCase()}] [${source}]${ctx} ${message}`;
}

export const Logger = {
  debug(source: string, message: string, data?: unknown, options?: LoggerOptions) {
    if (isDebug) {
      console.debug(format("debug", source, message, options), data ?? "");
    }
  },
  info(source: string, message: string, data?: unknown, options?: LoggerOptions) {
    console.info(format("info", source, message, options), data ?? "");
  },
  warn(source: string, message: string, data?: unknown, options?: LoggerOptions) {
    console.warn(format("warn", source, message, options), data ?? "");
  },
  error(source: string, message: string, data?: unknown, options?: LoggerOptions) {
    console.error(format("error", source, message, options), data ?? "");
  },
};
