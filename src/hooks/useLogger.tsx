import { useAppStateContext } from "@/context/AppStateContext";
import { Logger } from "@/utils/logger";
import { useAccount } from "wagmi";
import type { LoggerOptions } from "@/types/logger";
export function useLogger(loggerFileName: string) {
  const { selectedNetwork, receivedToken } = useAppStateContext();
  const { address } = useAccount();

  return {
    debug: (message: string, data?: unknown, options?: LoggerOptions) =>
      Logger.debug(loggerFileName, message, data, {
        ...options,
        address,
        selectedNetworkId: selectedNetwork.id.toString(),
        receivedToken,
      }),
    info: (message: string, data?: unknown, options?: LoggerOptions) =>
      Logger.info(loggerFileName, message, data, {
        ...options,
        address,
        selectedNetworkId: selectedNetwork.id.toString(),
        receivedToken,
      }),
    warn: (message: string, data?: unknown, options?: LoggerOptions) =>
      Logger.warn(loggerFileName, message, data, {
        ...options,
        address,
        selectedNetworkId: selectedNetwork.id.toString(),
        receivedToken,
      }),
    error: (message: string, data?: unknown, options?: LoggerOptions) =>
      Logger.error(loggerFileName, message, data, {
        ...options,
        address,
        selectedNetworkId: selectedNetwork.id.toString(),
        receivedToken,
      }),
  };
}
