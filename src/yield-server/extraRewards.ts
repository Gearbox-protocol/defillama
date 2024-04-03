import { GHO_TOKEN, POOL_GHO_V3 } from "./constants";
import type { Address, FarmInfo } from "./types";

interface ExtraRewardsInfo {
  getFarmInfo: (timestamp: bigint) => FarmInfo<bigint>;
  token: Address;
}

export const EXTRA_REWARDS: Record<Address, ExtraRewardsInfo[]> = {
  [POOL_GHO_V3]: [
    {
      token: GHO_TOKEN,
      getFarmInfo: (timestamp: bigint) => {
        const GHO_DECIMALS = 10n ** 18n;
        const REWARD_PERIOD = 14n * 24n * 60n * 60n;
        const REWARDS_FIRST_START = 1711448651n;
        const REWARDS_FIRST_END = REWARDS_FIRST_START + REWARD_PERIOD;
        const REWARDS_SECOND_END = REWARDS_FIRST_END + REWARD_PERIOD;
        const REWARD_FIRST_PART = 15000n * GHO_DECIMALS;
        const REWARD_SECOND_PART = 10000n * GHO_DECIMALS;
        const reward =
          timestamp >= REWARDS_FIRST_END
            ? REWARD_SECOND_PART
            : REWARD_FIRST_PART;
        return {
          balance: 0n,
          duration: REWARD_PERIOD,
          finished:
            timestamp >= REWARDS_FIRST_END
              ? REWARDS_SECOND_END
              : REWARDS_FIRST_END,
          reward: reward,
        };
      },
    },
  ],
};
