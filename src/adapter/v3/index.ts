import type { ChainApi } from "@defillama/sdk";

import { ADDRESS_PROVIDER_V3 } from "../constants";
import { v3Abis } from "./abi";
import type {
  CreditAccountData,
  CreditManagerData,
  PoolDataV3,
  TokenAndOwner,
} from "./types";

export async function getV3TVL(
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  const dc300 = await getDataCompressorV3(block, api);
  // Get Current CMs
  const creditManagers = await getCreditManagersV3(dc300, block, api);
  // Silently throw if no CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map(cm => getV3CAs(dc300, cm.addr, block, api)),
  );

  return caValues.flat();
}

export async function getCreditManagersV3(
  dc300: string,
  block: number,
  api: ChainApi,
): Promise<CreditManagerData[]> {
  return api.call({
    // IDataCompressorV3_00__factory.createInterface().getFunction("getCreditManagersV3List").format(ethers.utils.FormatTypes.full)
    abi: v3Abis["getCreditManagersV3List"],
    target: dc300,
    block,
  });
}

async function getV3CAs(
  dc300: string,
  creditManager: string,
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  try {
    const accs: CreditAccountData[] = await api.call({
      // IDataCompressorV3_00__factory.createInterface().getFunction("getCreditAccountsByCreditManager").format(ethers.utils.FormatTypes.full)
      target: dc300,
      abi: v3Abis["getCreditAccountsByCreditManager"],
      params: [creditManager, []] as any,
      block,
    });
    const result: TokenAndOwner[] = [];
    for (const acc of accs) {
      for (const { balance, token } of acc.balances) {
        // reduce noize
        if (balance !== "0" && balance !== "1") {
          result.push({
            addr: acc.addr,
            bal: balance,
            token: token,
          });
        }
      }
    }
    return result;
  } catch (e) {
    // console.error(`getV3CAs failed for ${creditManager}: ${e}`);
    // for some creditManagers this will currently fail with out of gas error - this is the workaround
    return getV3CAsWithoutCompressor(creditManager, block, api);
  }
}

async function getV3CAsWithoutCompressor(
  creditManager: string,
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  const accs: string[] = await api.call({
    target: creditManager,
    abi: v3Abis["creditAccounts"],
    params: [],
    block,
  });
  const collateralTokensCount = await api.call({
    target: creditManager,
    abi: v3Abis["collateralTokensCount"],
  });
  const bitMasks: bigint[] = [];
  for (let i = 0; i < collateralTokensCount; i++) {
    bitMasks.push(1n << BigInt(i));
  }
  const collateralTokens: string[] = await api.multiCall({
    abi: v3Abis["getTokenByMask"],
    calls: bitMasks.map(bm => ({
      target: creditManager,
      params: [bm],
    })),
    block,
  });
  const result: TokenAndOwner[] = [];
  for (const token of collateralTokens) {
    const balances = await api.multiCall({
      abi: "erc20:balanceOf",
      calls: accs.map(owner => ({ target: token, params: [owner] })),
      permitFailure: true,
    });
    for (let i = 0; i < balances.length; i++) {
      const bal = balances[i];
      if (bal) {
        result.push({ token, addr: accs[i], bal });
      }
    }
  }

  return result;
}

export async function getV3Borrowed(
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  const dc300 = await getDataCompressorV3(block, api);
  // Get Current CMs
  const pools = await getPoolsV3(dc300, block, api);
  return pools.map(pool => ({
    addr: pool.addr,
    bal: pool.totalBorrowed,
    token: pool.underlying,
  }));
}

export async function getPoolsV3(
  dc300: string,
  block: number,
  api: ChainApi,
): Promise<PoolDataV3[]> {
  return api.call({
    // IDataCompressorV3_00__factory.createInterface().getFunction("getPoolsV3List").format(ethers.utils.FormatTypes.full)
    abi: v3Abis["getPoolsV3List"],
    target: dc300,
    block,
  });
}

export async function getDataCompressorV3(
  block: number,
  api: ChainApi,
): Promise<string> {
  return api.call({
    abi: v3Abis["getAddressOrRevert"],
    target: ADDRESS_PROVIDER_V3[api.chain],
    params: [
      // cast format-bytes32-string "DATA_COMPRESSOR"
      "0x444154415f434f4d50524553534f520000000000000000000000000000000000",
      300,
    ],
    block,
  });
}
