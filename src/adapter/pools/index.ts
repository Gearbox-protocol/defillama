import type { ChainApi } from "@defillama/sdk";

import { ADDRESS_PROVIDER_V3 } from "../constants";
import { poolAbis } from "./abi";

export async function getPools(
  block: number,
  api: ChainApi,
): Promise<Array<[token: string, balance: string]>> {
  const contractsRegisterAddr: string = await api.call({
    block,
    abi: poolAbis["getAddressOrRevert"],
    target: ADDRESS_PROVIDER_V3[api.chain],
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

  const poolUnderlyings: string[] = await api.multiCall({
    abi: poolAbis["underlyingToken"],
    calls: pools.map(target => ({ target })),
    block,
  });
  return poolUnderlyings.map((u, i) => [u, pools[i]]);
}
