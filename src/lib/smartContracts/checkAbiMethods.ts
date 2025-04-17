import type { PublicClient } from "viem";
import { encodeFunctionData, parseAbi } from "viem";

// TODO: There should be a check of implemenetation of a contract, not proxy!

const requiredMethods = [
  "allowance(address,address)",
  "approve(address,uint256)",
  "transferFrom(address,address,uint256)",
] as const;

// Helper function to check a single token
const checkSingleToken = async (
  tokenAddress: `0x${string}`,
  publicClient: PublicClient
): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};

  // Create all contract calls in parallel
  const calls = requiredMethods.map((method) => {
    const abi = parseAbi([`function ${method}` as const]);
    const data = encodeFunctionData({
      abi,
      functionName: method.split("(")[0] as "allowance" | "approve" | "transferFrom",
      args: method.includes("transferFrom")
        ? ([
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            0n,
          ] as const)
        : method.includes("allowance")
          ? ([
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ] as const)
          : (["0x0000000000000000000000000000000000000000", 0n] as const),
    });

    return publicClient
      .call({ to: tokenAddress, data })
      .then(() => true)
      .catch(() => false);
  });

  // Wait for all calls to complete
  const methodResults = await Promise.all(calls);

  // Map results back to method names
  requiredMethods.forEach((method, index) => {
    results[method] = methodResults[index];
  });

  return results;
};

// New function to check multiple tokens
export const checkTokensHaveMethods = async (
  tokenAddresses: Array<`0x${string}`>,
  publicClient: PublicClient
): Promise<Record<`0x${string}`, Record<string, boolean>>> => {
  const results = await Promise.all(
    tokenAddresses.map((address) =>
      checkSingleToken(address, publicClient).then((methodResults) => ({
        [address]: methodResults,
      }))
    )
  );

  // Combine all results into a single object
  return Object.assign({}, ...results);
};

// Keep the original function for backward compatibility
export const checkTokenHasMethods = checkSingleToken;
