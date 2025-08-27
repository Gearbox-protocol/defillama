import type { ChainApi } from "@defillama/sdk";

import { getPools } from "./pools";
import { getV1TVL } from "./v1";
import type { TokenAndOwner } from "./v1/types";
import { getV2TVL } from "./v2";
import {
  getV310CreditAccounts,
  getV310PoolsAvailable,
  getV310PoolsBorrowed,
  mergePools,
} from "./v31";

interface ApiParameter {
  api: ChainApi;
}

async function tvl(
  _timestamp: number,
  _block: number,
  _: unknown,
  { api }: ApiParameter,
): Promise<void> {
  const allBalances: TokenAndOwner[] = [];
  const block = await api.getBlock();
  // v1, v2 and v300 legacy pools
  const legacyPools = await getPools(block, api);
  // all v300 and v310 pools
  const poolsV310 = await getV310PoolsAvailable(block, api);
  // for networks with legacy market configurators, v300 pools might overlap
  const pools = mergePools(legacyPools, poolsV310);
  allBalances.push(...pools);

  if (api.chain === "ethereum") {
    // v1 and v2:
    // return sum of balances of all credit accounts by credit manager in underlying
    const v1Balances = await getV1TVL(block, api);
    const v2Balances = await getV2TVL(block, api);
    allBalances.push(...v1Balances, ...v2Balances);
  }

  const v310Balances = await getV310CreditAccounts(block, api);
  allBalances.push(...v310Balances);

  // Merge all balances for each token
  for (const i of allBalances) {
    api.add(i.token, i.bal);
  }
}

async function borrowed(
  _timestamp: number,
  _block: number,
  _: unknown,
  { api }: ApiParameter,
): Promise<void> {
  const block = await api.getBlock();
  const borrowed = await getV310PoolsBorrowed(block, api);
  for (const { token, bal } of borrowed) {
    api.add(token, bal);
  }
}

export default {
  ...Object.fromEntries(
    [
      "ethereum",
      "arbitrum",
      "optimism",
      "sonic",
      "hemi",
      "lisk",
      "etherlink",
    ].map(n => [n, { tvl, borrowed }]),
  ),
  hallmarks: [[1666569600, "LM begins"]],
  methodology: `Retrieves the tokens in each Gearbox pool & value of all Credit Accounts (V1/V2/V3) denominated in the underlying token.`,
  misrepresentedTokens: true,
};
