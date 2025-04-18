import type { PublicClient } from "viem";
import { getImplementationAddress } from "./getImplementation";
import { checkMethods } from "./checkMethods";

export type TokenSellabilityResult = {
  address: `0x${string}`;
  sellable: boolean;
  proxyHasMethods: boolean;
  implHasMethods: boolean;
  implementation?: `0x${string}`;
};

export const checkIfTokenIsSellable = async (
  tokenAddress: `0x${string}`,
  client: PublicClient
): Promise<TokenSellabilityResult> => {
  const proxyMethods = await checkMethods(tokenAddress, client);
  const proxyHasAll = Object.values(proxyMethods).every(Boolean);

  let implHasAll = false;
  let implementation: `0x${string}` | undefined = undefined;

  const impl = await getImplementationAddress(client, tokenAddress);
  if (impl) {
    implementation = impl;
    const implMethods = await checkMethods(impl, client);
    implHasAll = Object.values(implMethods).every(Boolean);
  }

  return {
    address: tokenAddress,
    sellable: proxyHasAll || implHasAll,
    proxyHasMethods: proxyHasAll,
    implHasMethods: implHasAll,
    implementation,
  };
};

export const checkTokensSellability = async (
  tokenAddresses: Array<`0x${string}`>,
  client: PublicClient
): Promise<Array<TokenSellabilityResult>> => {
  return await Promise.all(tokenAddresses.map((token) => checkIfTokenIsSellable(token, client)));
};
