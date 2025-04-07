import { toaster } from "@/components/ui/Toaster";
import { erc20Abi } from "@/lib/abis/erc-20";
import { stringToBigInt } from "@/lib/utils";

import { SelectedToken } from "@/lib/types/tokens";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@/configs/wagmi";

export const approveTokensList = async (
  setApprovedTokens: (tokens: SelectedToken[]) => void,
  tokensToApprove: SelectedToken[],
  owner: `0x${string}`,
  spender: `0x${string}`
) => {
  const approvedTokens: SelectedToken[] = [];

  for (const token of tokensToApprove) {
    try {
      const balance = stringToBigInt(token.balance);

      if (balance === BigInt(0)) {
        toaster.create({
          title: "Skip",
          description: `${token.symbol} has 0 balance`,
          type: "info",
        });
        continue;
      }

      const allowance = (await readContract(config, {
        address: token.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [owner, spender],
      })) as bigint;

      if (allowance >= balance) {
        toaster.create({
          title: "Already approved",
          description: `${token.symbol} allowance is sufficient`,
          type: "success",
        });
        approvedTokens.push(token);
        setApprovedTokens(approvedTokens);
        continue;
      }

      const hash = await writeContract(config, {
        address: token.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, balance],
      });

      toaster.create({
        title: "Approval sent",
        description: `Waiting for ${token.symbol} approval...`,
        type: "info",
      });

      const { status } = await waitForTransactionReceipt(config, { hash });

      if (status === "success") {
        approvedTokens.push(token);
        toaster.create({
          title: "Approved",
          description: `${token.symbol} approved`,
          type: "success",
        });
        setApprovedTokens(approvedTokens);
      } else {
        toaster.create({
          title: "Error",
          description: `Approval failed for ${token.symbol}`,
          type: "error",
        });
      }
    } catch (err: any) {
      console.error(`[approveTokensIfNeeded] Error with ${token.symbol}:`, err);
      toaster.create({
        title: "Error",
        description: `Approval error for ${token.symbol}: ${
          err.message ?? "unknown"
        }`,
        type: "error",
      });
    }
  }

  return approvedTokens;
};
