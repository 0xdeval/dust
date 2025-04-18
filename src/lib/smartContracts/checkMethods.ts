import type { PublicClient } from "viem";
import { encodeFunctionData, parseAbi } from "viem";
import { REQUIRED_METHOD_SELECTORS } from "@/lib/constants";

export const methodAbiMap = {
  "approve(address,uint256)": parseAbi(["function approve(address,uint256)"] as const),
  "transferFrom(address,address,uint256)": parseAbi([
    "function transferFrom(address,address,uint256)",
  ] as const),
  "allowance(address,address)": parseAbi(["function allowance(address,address)"] as const),
} as const;

export const checkMethods = async (
  contractAddress: `0x${string}`,
  publicClient: PublicClient
): Promise<Record<string, boolean>> => {
  console.log(`Checking methods for ${contractAddress}`);

  const bytecode = await publicClient.getCode({ address: contractAddress });

  console.log(`Bytecode for ${contractAddress} received`);
  const cleanedBytecode = bytecode?.toLowerCase().replace(/^0x/, "") ?? "";

  console.log(`Cleaned bytecode for ${contractAddress}`);

  const results: Record<string, boolean> = {};

  await Promise.all(
    Object.entries(REQUIRED_METHOD_SELECTORS).map(async ([method, selector]) => {
      // 1. Check if selector is in bytecode
      if (cleanedBytecode.includes(selector.slice(2))) {
        console.log(`Bytecode for tokens ${contractAddress}: ${cleanedBytecode}`);
        results[method] = true;
        return;
      }

      // 2. Fallback to actual call with dummy args
      console.log(`Parsing abi for ${contractAddress}`);
      const abi = methodAbiMap[method as keyof typeof methodAbiMap];
      const functionName = method.split("(")[0] as "approve" | "allowance" | "transferFrom";

      const args = method.includes("transferFrom")
        ? ([
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            1n,
          ] as const)
        : method.includes("allowance")
          ? ([
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ] as const)
          : (["0x0000000000000000000000000000000000000000", 1n] as const);

      const data = encodeFunctionData({
        abi,
        functionName,
        args,
      });

      try {
        await publicClient.call({ to: contractAddress, data });
        results[method] = true;
        return;
      } catch (err) {
        console.warn(
          `eth_call failed on ${method} for ${contractAddress}, trying estimateGas. Revert: ${err}`
        );
        try {
          await publicClient.estimateGas({ to: contractAddress, data });
          results[method] = true;
        } catch (err2) {
          console.warn(`estimateGas failed on ${method} for ${contractAddress}`);
          results[method] = false;
        }
      }
    })
  );

  return results;
};
