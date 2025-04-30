import { toaster } from "@/ui/Toaster";
import { erc20Abi } from "@/utils/abis/erc-20";

import type { SelectedToken } from "@/types/tokens";
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { config } from "@/configs/wagmi";

export const approveTokensList = async (
  setApprovedTokens: (tokens: Array<SelectedToken>) => void,
  tokensToApprove: Array<SelectedToken>,
  owner: `0x${string}`,
  spender: `0x${string}`
) => {
  let approvedTokens: Array<SelectedToken> = [];

  for (const token of tokensToApprove) {
    try {
      if (token.rawBalance === BigInt(0)) {
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

      if (allowance >= token.rawBalance) {
        toaster.create({
          title: "Already approved",
          description: `${token.symbol} allowance is sufficient`,
          type: "success",
        });
        approvedTokens = [...approvedTokens, token];
        setApprovedTokens([...approvedTokens]);
        continue;
      }

      const hash = await writeContract(config, {
        address: token.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, token.rawBalance],
      });

      toaster.create({
        title: "Approval sent",
        description: `Waiting for ${token.symbol} approval. Amount: ${token.balance} ${token.symbol}`,
        type: "info",
      });

      const { status } = await waitForTransactionReceipt(config, { hash });

      if (status === "success") {
        approvedTokens = [...approvedTokens, token];
        setApprovedTokens([...approvedTokens]);
        toaster.create({
          title: "Approved",
          description: `${token.symbol} approved`,
          type: "success",
        });
      } else {
        toaster.create({
          title: "Error",
          description: `Approval failed for ${token.symbol}`,
          type: "error",
        });
      }
    } catch (err) {
      console.error(`[approveTokensIfNeeded] Error with ${token.symbol}:`, err);
      toaster.create({
        title: "Error",
        description: `Approval error for ${token.symbol}: ${err ?? "unknown"}`,
        type: "error",
      });
    }
  }

  return approvedTokens;
};
