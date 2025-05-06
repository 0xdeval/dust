import type { Token } from "@/types/tokens";

export const convertAddressesToTokens = (
  addresses: Array<string>,
  originalTokens: Array<Token>
): Array<Token> => {
  return addresses
    .map((address) => {
      const token = originalTokens.find((t) => {
        const match = t.address.toLowerCase() === address.toLowerCase();
        return match;
      });

      if (!token) {
        console.warn(`Token with address ${address} not found in original list`);
        return null;
      }
      return token;
    })
    .filter((token): token is Token => token !== null);
};
