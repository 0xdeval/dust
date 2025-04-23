import type { Token } from "@/types/tokens";

export const convertAddressesToTokens = (
  addresses: Array<string>,
  originalTokens: Array<Token>
): Array<Token> => {
  return addresses.map((address) => {
    const token = originalTokens.find((t) => t.address.toLowerCase() === address.toLowerCase());
    if (!token) throw new Error(`Token with address ${address} not found in original list`);
    return token;
  });
};
