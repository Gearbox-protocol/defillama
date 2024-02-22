import type { ChainApi } from "@defillama/sdk";

import { getPools } from "./pools";
import { getV1TVL } from "./v1";
import { getV2TVL } from "./v2";
import { getV3TVL } from "./v3";

interface ApiParameter {
  api: ChainApi;
}

async function tvl(
  timestamp: number,
  block: number,
  _: unknown,
  { api }: ApiParameter,
) {
  // Pool TVL (Current token balances)
  const tokensAndOwners = await getPools(block, api);

  // CreditAccounts TVL
  const v1Balances = await getV1TVL(block, api);
  const v2Balances = await getV2TVL(block, api);
  const v3Balances = await getV3TVL(block, api);

  // Merge all balances for each token
  [...v1Balances, ...v2Balances, ...v3Balances].forEach(i => {
    api.add(i.token, i.bal);
    tokensAndOwners.push([i.token, i.addr]);
  });

  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  hallmarks: [[1666569600, "LM begins"]],
  ethereum: {
    tvl,
  },
  methodology: `Retrieves the tokens in each Gearbox pool (WETH/DAI/WBTC/USDC/wstETH) & value of all Credit Accounts (V1/V2/V3) denominated in the underlying token.`,
  misrepresentedTokens: true,
};
