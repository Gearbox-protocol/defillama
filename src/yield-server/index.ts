import { api2 } from "@defillama/sdk";
import type { Chain } from "@defillama/sdk/build/types";

// @ts-ignore
import { keepFinite } from "../utils";
import abis from "./abis";
import {
  ADDRESS_PROVIDER_V3,
  GEAR_TOKEN,
  POOL_USDT_V3_BROKEN,
} from "./constants";
import { EXTRA_REWARDS } from "./extraRewards";
import type {
  Address,
  BigNumberish,
  FarmInfo,
  FarmingPoolData,
  Fees,
  LlamaCoins,
  PoolDataV3,
  PoolInfoV3,
  SupplyInfo,
  TokenData,
} from "./types";

const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n;
const WAD = 10n ** 18n;
const RAY = 10n ** 27n;
const PERCENTAGE_FACTOR = 10000n;

async function call<T>(
  ...args: Parameters<(typeof api2)["abi"]["call"]>
): Promise<T> {
  return api2.abi.call(...args);
}

async function multiCall<T>(
  ...args: Parameters<(typeof api2)["abi"]["multiCall"]>
): Promise<Array<T>> {
  return api2.abi.multiCall(...args);
}

/**
 * Bulk loads token prices from defillama, returns mapping "token (lowercase)" => price
 * Price is converted into bigint with 10^18 precision
 * See https://defillama.com/docs/api
 */
async function fetchLLamaPrices(
  chain: Chain,
  addresses: Address[],
): Promise<Record<Address, bigint>> {
  const coins = addresses.map(address => `${chain}:${address}`).join(",");
  const resp = await fetch(`https://coins.llama.fi/prices/current/${coins}`);
  const data: LlamaCoins = await resp.json();
  const prices: Record<Address, bigint> = {};
  for (const [coin, info] of Object.entries(data.coins)) {
    const address = coin.split(":")[1];
    prices[address.toLowerCase() as Address] = BigInt(Number(WAD) * info.price);
  }
  return prices;
}

/**
 * Returns mapping pool.address -> daoFee, where daoFee is a feeInterest from first credit manager that uses this pool
 * @param chain
 * @returns
 */
async function getPoolsDaoFees(chain: Chain): Promise<Record<Address, bigint>> {
  const contractsRegisterAddr = await call<Address>({
    abi: abis.getAddressOrRevert,
    target: ADDRESS_PROVIDER_V3,
    params: [
      // cast format-bytes32-string "CONTRACTS_REGISTER"
      "0x434f4e5452414354535f52454749535445520000000000000000000000000000",
      0,
    ],
    chain,
  });
  // all V1, V2, V3 credit managers
  const cms = await call<Address[]>({
    target: contractsRegisterAddr,
    abi: abis.getCreditManagers,
    chain,
  });
  // for each CM, get its pool address
  // this will fail for CMs v1
  const pools = await multiCall<Address | null>({
    abi: abis.pool,
    calls: cms.map(target => ({ target })),
    chain,
    permitFailure: true,
  });
  // ... and also try to get fees
  // it will fail for v1 managers, but we don't care about them
  // it's less calls than we need for checking versions
  const daoFees = await multiCall<Fees | null>({
    abi: abis.fees,
    calls: cms.map(target => ({ target })),
    chain,
    permitFailure: true,
  });

  const result: Record<Address, bigint> = {};
  for (let i = 0; i < daoFees.length; i++) {
    const daoFee = daoFees[i];
    const pool = pools[i]?.toLowerCase();
    // null for v1 cms
    if (daoFee && pool) {
      // basically, we don't care from which CM to take feeInterest for pool
      // feeInterest is 5000 for v2 and 2500 for v3 as of time of writing
      result[pool as Address] = BigInt(daoFee.feeInterest);
    }
  }
  return result;
}

async function getPoolsV3(chain: Chain): Promise<PoolInfoV3[]> {
  const stakedDieselTokens: Address[] = [
    "0x9ef444a6d7F4A5adcd68FD5329aA5240C90E14d2", // sdUSDCV3
    "0xA8cE662E45E825DAF178DA2c8d5Fae97696A788A", // sdWBTCV3
    "0x0418fEB7d0B25C411EB77cD654305d29FcbFf685", // sdWETHV3
    "0x16adAb68bDEcE3089D4f1626Bb5AEDD0d02471aD", // sdUSDTV3
    "0xE2037090f896A858E3168B978668F22026AC52e7", // sdGHOV3
    "0xC853E4DA38d9Bd1d01675355b8c8f3BBC1451973", // sdDAIV3
  ];
  const [farmInfos, totalSupplies, poolV3Addrs] = await Promise.all([
    multiCall<FarmInfo<BigNumberish>>({
      abi: abis.farmInfo,
      calls: stakedDieselTokens.map(target => ({ target })),
      chain,
    }),
    multiCall<BigNumberish>({
      abi: abis.totalSupply,
      calls: stakedDieselTokens.map(target => ({ target })),
      chain,
    }),
    multiCall<Address>({
      abi: abis.stakingToken,
      calls: stakedDieselTokens.map(target => ({ target })),
      chain,
    }),
  ]);
  const farmingPoolsData: Record<Address, FarmingPoolData> = {};
  for (let i = 0; i < stakedDieselTokens.length; i++) {
    farmingPoolsData[poolV3Addrs[i]] = {
      stakedDieselToken: stakedDieselTokens[i],
      stakedDieselTokenSupply: BigInt(totalSupplies[i]),
      farmInfo: {
        balance: BigInt(farmInfos[i].balance),
        duration: BigInt(farmInfos[i].duration),
        finished: BigInt(farmInfos[i].finished),
        reward: BigInt(farmInfos[i].reward),
      },
    };
  }

  const dc300 = await call<Address>({
    abi: abis.getAddressOrRevert,
    target: ADDRESS_PROVIDER_V3,
    params: [
      // cast format-bytes32-string "DATA_COMPRESSOR"
      "0x444154415f434f4d50524553534f520000000000000000000000000000000000",
      300,
    ],
    chain,
  });

  const pools = await call<PoolDataV3[]>({
    target: dc300,
    abi: abis.getPoolsV3List,
    chain,
  });

  const decimals = await multiCall<BigNumberish>({
    abi: abis.decimals,
    calls: pools.map(p => ({
      target: p.dieselToken,
    })),
    chain,
  });

  return pools
    .map(
      (pool, i): PoolInfoV3 => ({
        pool: pool.addr,
        name: pool.name,
        availableLiquidity: BigInt(pool.availableLiquidity),
        totalBorrowed: BigInt(pool.totalBorrowed),
        supplyRate: BigInt(pool.supplyRate),
        baseInterestRate: BigInt(pool.baseInterestRate),
        dieselRate: BigInt(pool.dieselRate_RAY),
        underlying: pool.underlying,
        withdrawFee: BigInt(pool.withdrawFee),
        symbol: pool.symbol,
        decimals: 10n ** BigInt(decimals[i]),
        ...farmingPoolsData[pool.addr],
      }),
    )
    .filter(({ pool }) => pool.toLowerCase() !== POOL_USDT_V3_BROKEN);
}

/**
 * Returns mapping between tokens (in lower case) and their symbols, decimals and prices
 */
async function getTokensData(
  chain: Chain,
  pools: PoolInfoV3[],
): Promise<Record<Address, TokenData>> {
  let tokens = pools.map(p => p.underlying);
  tokens.push(GEAR_TOKEN);
  tokens.push(
    ...Object.values(EXTRA_REWARDS).flatMap(poolExtras =>
      poolExtras.map(({ token }) => token),
    ),
  );
  tokens = Array.from(new Set(tokens.map(t => t.toLowerCase() as Address)));
  const prices = await fetchLLamaPrices(chain, tokens);

  const symbols = await multiCall<string>({
    abi: abis.symbol,
    calls: tokens.map(target => ({ target })),
    chain,
  });
  const decimals = await multiCall<BigNumberish>({
    abi: abis.decimals,
    calls: tokens.map(target => ({ target })),
    chain,
  });
  const result: Record<Address, TokenData> = {};
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    result[token] = {
      symbol: symbols[i],
      decimals: 10n ** BigInt(decimals[i]),
      price: prices[token],
    };
  }
  return result;
}

function calcApyV3(
  info: FarmInfo<bigint>,
  supply: SupplyInfo,
  rewardPrice: bigint,
): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (info.finished <= now) {
    return 0;
  }
  if (supply.amount <= 0n) {
    return 0;
  }
  if (supply.price === 0n || rewardPrice === 0n) {
    return 0;
  }
  if (info.duration === 0n) {
    return 0;
  }

  const supplyUsd = (supply.price * supply.amount) / supply.decimals;
  const rewardUsd = (rewardPrice * info.reward) / WAD;

  return (
    Number(
      (PERCENTAGE_FACTOR * rewardUsd * SECONDS_PER_YEAR) /
        (supplyUsd * info.duration),
    ) / 100
  );
}

function calculateTvl(
  availableLiquidity: bigint,
  totalBorrowed: bigint,
  price: bigint,
  decimals: bigint,
): bigint {
  // ( availableLiquidity + totalBorrowed ) * underlying price = total pool balance in USD
  return (((availableLiquidity + totalBorrowed) / decimals) * price) / WAD;
}

function getApyV3(
  pools: PoolInfoV3[],
  tokens: Record<Address, TokenData>,
  daoFees: Record<Address, bigint>,
) {
  return pools.map(pool => {
    const underlying = pool.underlying.toLowerCase() as Address;
    const poolAddr = pool.pool.toLowerCase() as Address;
    const underlyingPrice = tokens[underlying].price;
    const daoFee = daoFees[poolAddr] ?? 0;
    const totalSupplyUsd = calculateTvl(
      pool.availableLiquidity,
      pool.totalBorrowed,
      underlyingPrice,
      pool.decimals,
    );
    const totalBorrowUsd = calculateTvl(
      0n,
      pool.totalBorrowed,
      underlyingPrice,
      pool.decimals,
    );
    const tvlUsd = totalSupplyUsd - totalBorrowUsd;
    const dieselPrice = (underlyingPrice * pool.dieselRate) / RAY;

    const supplyInfo: SupplyInfo = {
      amount: pool.stakedDieselTokenSupply,
      decimals: pool.decimals,
      price: dieselPrice,
    };
    let apyRewardTotal = calcApyV3(
      pool.farmInfo,
      supplyInfo,
      tokens[GEAR_TOKEN].price,
    );
    const extraRewardTokens: Address[] = [];
    for (const { token, getFarmInfo } of EXTRA_REWARDS[poolAddr] ?? []) {
      extraRewardTokens.push(token);
      const farmInfo = getFarmInfo(
        BigInt(Math.floor(new Date().getTime() / 1000)),
      );
      const apyReward = calcApyV3(farmInfo, supplyInfo, tokens[token].price);
      apyRewardTotal += apyReward;
    }

    return {
      pool: poolAddr,
      chain: "Ethereum",
      project: "gearbox",
      symbol: tokens[underlying].symbol,
      tvlUsd: Number(tvlUsd),
      apyBase: (Number(pool.supplyRate) / 1e27) * 100,
      apyReward: apyRewardTotal,
      underlyingTokens: [pool.underlying],
      rewardTokens: [GEAR_TOKEN, ...extraRewardTokens],
      url: `https://app.gearbox.fi/pools/${pool.pool}`,
      // daoFee here is taken from last cm connected to this pool. in theory, it can be different for different CMs
      // in practice, it's 25% for v3 cms and 50% for v2 cms
      apyBaseBorrow:
        (Number(daoFee + PERCENTAGE_FACTOR) *
          (Number(pool.baseInterestRate) / 1e27)) /
        100,
      apyRewardBorrow: 0,
      totalSupplyUsd: Number(totalSupplyUsd),
      totalBorrowUsd: Number(totalBorrowUsd),
      ltv: 0, // this is currently just for the isolated earn page
    };
  });
}

async function getApy() {
  const daoFees = await getPoolsDaoFees("ethereum");
  const v3Pools = await getPoolsV3("ethereum");
  const tokens = await getTokensData("ethereum", v3Pools);
  const pools = getApyV3(v3Pools, tokens, daoFees);
  return pools.filter(i => keepFinite(i));
}

export default {
  timetravel: false,
  apy: getApy,
};
