import type { ChainApi } from "@defillama/sdk";

import { ADDRESS_PROVIDER_V300 } from "../constants";
import { poolAbis } from "./abi";

interface TokenAndOwner {
  addr: string;
  token: string;
  bal: string;
}

/**
 * Returns v1, v2 and v300 legacy pools
 * @param block
 * @param api
 * @returns
 */
export async function getPools(
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  const target = ADDRESS_PROVIDER_V300[api.chain];
  // v310 networks
  if (!target) {
    return [];
  }
  const contractsRegisterAddr: string = await api.call({
    block,
    abi: poolAbis["getAddressOrRevert"],
    target,
    params: [
      // cast format-bytes32-string "CONTRACTS_REGISTER"
      "0x434f4e5452414354535f52454749535445520000000000000000000000000000",
      0,
    ],
  });

  // Get gearbox pools from the contractsRegister, and underlyingToken for each pool
  let pools: string[] = await api.call({
    abi: poolAbis["getPools"],
    target: contractsRegisterAddr,
    block,
  });
  // RM wstETH pool
  pools = pools.filter(p => p !== "0xB8cf3Ed326bB0E51454361Fb37E9E8df6DC5C286");

  const underlyings: string[] = await api.multiCall({
    abi: poolAbis["underlyingToken"],
    calls: pools.map(target => ({ target })),
    block,
  });

  const balances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: pools.map((p, i) => ({ target: underlyings[i], params: [p] })),
    permitFailure: true,
  });

  return balances.map((b, i) => ({
    addr: pools[i],
    token: underlyings[i],
    bal: b,
  }));
}
