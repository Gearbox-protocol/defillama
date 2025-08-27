import type { ChainApi } from "@defillama/sdk";

import abi from "./abi";
import {
  DEFILLAMA_COMPRESSOR_V310,
  LEGACY_MARKET_CONFIGURATORS,
} from "./constants";
import type {
  DefillamaCreditAccountData,
  DefillamaPoolData,
  TokenAndOwner,
} from "./types";
import { accountToTokenAndOwner } from "./utils";

export async function getV310PoolsBorrowed(
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  const pools = await loadPools(block, api);
  return pools.map(pool => ({
    addr: pool.pool,
    bal: pool.totalBorrowed,
    token: pool.underlying,
  }));
}

export async function getV310PoolsAvailable(
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  const pools = await loadPools(block, api);
  return pools.map(pool => ({
    addr: pool.pool,
    bal: pool.availableLiquidity,
    token: pool.underlying,
  }));
}

export async function getV310CreditAccounts(
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  const cms = await loadCreditManagers(block, api);
  const allAccounts: DefillamaCreditAccountData[] = [];
  for (const cm of cms) {
    let accounts = await loadCreditAccounts(block, api, cm);
    accounts = accounts.filter(a => Number(a.debt) !== 0);
    allAccounts.push(...accounts);
  }
  return allAccounts.flatMap(accountToTokenAndOwner);
}

async function loadPools(
  block: number,
  api: ChainApi,
): Promise<DefillamaPoolData[]> {
  const legacyMcs = LEGACY_MARKET_CONFIGURATORS[api.chain];
  const promises = [
    api.call({
      abi: abi.getPools,
      target: DEFILLAMA_COMPRESSOR_V310,
      params: [],
      block,
    }),
  ];
  if (legacyMcs?.length) {
    promises.push(
      api.call({
        abi: abi.getLegacyPools,
        target: DEFILLAMA_COMPRESSOR_V310,
        params: [legacyMcs],
        block,
      }),
    );
  }
  const allPools: DefillamaPoolData[][] = await Promise.all(promises);
  return allPools.flat();
}

async function loadCreditManagers(
  block: number,
  api: ChainApi,
): Promise<string[]> {
  const legacyMcs = LEGACY_MARKET_CONFIGURATORS[api.chain];
  const promises = [
    api.call({
      abi: abi.getCreditManagers,
      target: DEFILLAMA_COMPRESSOR_V310,
      params: [],
      block,
    }),
  ];
  if (legacyMcs?.length) {
    promises.push(
      api.call({
        abi: abi.getLegacyCreditManagers,
        target: DEFILLAMA_COMPRESSOR_V310,
        params: [legacyMcs],
        block,
      }),
    );
  }
  const allCMs: string[][] = await Promise.all(promises);
  return allCMs.flat();
}

async function loadCreditAccounts(
  block: number,
  api: ChainApi,
  creditManager: string,
  limit = 1000,
): Promise<DefillamaCreditAccountData[]> {
  let offset = 0;
  // let page = 0;
  let creditAccounts: any[] = [];
  const result: any[] = [];
  do {
    creditAccounts = await loadCreditAccountsPage(
      block,
      api,
      creditManager,
      offset,
      limit,
    );
    result.push(...creditAccounts);
    // page++;
    offset += limit;
  } while (creditAccounts.length === limit);

  return result;
}

async function loadCreditAccountsPage(
  block: number,
  api: ChainApi,
  creditManager: string,
  offset: number,
  limit: number,
): Promise<DefillamaCreditAccountData[]> {
  const creditAccounts = await api.call({
    abi: abi.getCreditAccounts,
    target: DEFILLAMA_COMPRESSOR_V310,
    params: [creditManager, offset, limit],
    block,
  });
  return creditAccounts;
}
