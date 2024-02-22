import type { ChainApi } from "@defillama/sdk";

import { ADDRESS_PROVIDER_V3 } from "../constants";
import { v3Abis } from "./abi";
import { getPriceUpdates } from "./redstone";
import type { CreditAccountData, CreditManagerData } from "./types";

export async function getV3TVL(block: number, api: ChainApi) {
  const dc300 = await api.call({
    abi: v3Abis["getAddressOrRevert"],
    target: ADDRESS_PROVIDER_V3,
    params: [
      // cast format-bytes32-string "DATA_COMPRESSOR"
      "0x444154415f434f4d50524553534f520000000000000000000000000000000000",
      300,
    ],
    block,
  });
  // Get Current CMs
  const creditManagers = await getCreditManagersV3(dc300, block, api);
  // Silently throw if no CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map(cm => getV3CAs(dc300, cm.addr, block, api)),
  );

  return creditManagers.map((cm, i) => ({
    addr: cm.addr,
    token: cm.underlying,
    bal: caValues[i],
  }));
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
): Promise<string> {
  let accs: CreditAccountData[] = await api.call({
    // IDataCompressorV3_00__factory.createInterface().getFunction("getCreditAccountsByCreditManager").format(ethers.utils.FormatTypes.full)
    target: dc300,
    abi: v3Abis["getCreditAccountsByCreditManager"],
    params: [creditManager, []] as any,
    block,
  });
  const priceFeedsNeeded = new Set<string>();
  accs.forEach(acc => {
    acc.priceFeedsNeeded.forEach(pf => priceFeedsNeeded.add(pf.toLowerCase()));
  });
  const priceUpdates = await getPriceUpdates(priceFeedsNeeded, block, api);
  accs = await api.call({
    target: dc300,
    abi: v3Abis["getCreditAccountsByCreditManager"],
    params: [creditManager, priceUpdates] as any,
    block,
  });
  let totalValue = 0n;
  accs.forEach(acc => {
    totalValue += BigInt(acc.totalValue);
  });

  return totalValue.toString();
}
