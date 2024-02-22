import type { ChainApi } from "@defillama/sdk";
import { toUtf8String } from "ethers";

import { ADDRESS_PROVIDER_V3 } from "../../constants";
// @ts-ignore
import { getLogs } from "../helper/cache/getLogs";
import { redstoneAbis } from "./abi";
import { getRedstonePayloadForManualUsage } from "./redstone-lib";
import type { PriceOnDemand, RedstoneData, SetPriceFeedArgs } from "./types";

const REDSTONE_DICTIONARY: Record<string, string> = {
  STETH: "stETH",
};

export async function getPriceUpdates(
  tokens: Set<string> | undefined,
  block: number,
  api: ChainApi,
): Promise<PriceOnDemand[]> {
  const redstoneFeeds = await getRedstoneFeeds(tokens, block, api);
  return Promise.all(
    Object.entries(redstoneFeeds).map(([t, f]) =>
      getRedstonePayloadForManualUsage(t, {
        dataServiceId: f.dataServiceId,
        dataId: f.dataId,
        signersThreshold: 5,
      }),
    ),
  );
}

async function getRedstoneFeeds(
  tokens: Set<string> | undefined,
  block: number,
  api: ChainApi,
): Promise<Record<string, RedstoneData>> {
  const result: Record<string, RedstoneData> = {};
  const priceOracleV3Addr: string = await api.call({
    abi: redstoneAbis["getAddressOrRevert"],
    target: ADDRESS_PROVIDER_V3,
    params: [
      // cast format-bytes32-string "PRICE_ORACLE"
      "0x50524943455f4f5241434c450000000000000000000000000000000000000000",
      300,
    ],
    block,
  });
  const feeds = await (tokens
    ? getPriceFeedsForTokens(priceOracleV3Addr, Array.from(tokens), block, api)
    : getAllPriceFeeds(priceOracleV3Addr, block, api));

  const dataFeedIds = await api.multiCall({
    abi: redstoneAbis["dataFeedId"],
    calls: feeds.map(([_, priceFeed]) => ({
      target: priceFeed,
    })),
    permitFailure: true,
    block,
  });
  for (let i = 0; i < feeds.length; i++) {
    const [token, priceFeed] = feeds[i];
    if (dataFeedIds[i]) {
      const id = toUtf8String(dataFeedIds[i])
        .trim()
        .replace(/\u0000/g, "");
      result[token] = {
        dataId: REDSTONE_DICTIONARY[id] ?? id,
        // TODO: it's better to get it from sdk-gov, but now all of them have this value
        dataServiceId: "redstone-primary-prod",
        priceFeed,
      };
    }
  }
  return result;
}

async function getPriceFeeds(
  priceOracleV3Addr: string,
  eventAbi: string,
  block: number,
  api: ChainApi,
): Promise<Array<[token: string, priceFeed: string]>> {
  const logs: SetPriceFeedArgs[] = await getLogs({
    api,
    eventAbi,
    fromBlock: 18797638, // price oracle v3 deployment block
    toBlock: block,
    target: priceOracleV3Addr,
    onlyArgs: true,
    extraKey: eventAbi.replace("event", "").trim().split("(")[0],
  });
  const result: Record<string, string> = {};
  for (const l of logs) {
    result[l[0].toLowerCase()] = l[1].toLowerCase();
  }
  return Object.entries(result);
}

async function getAllPriceFeeds(
  priceOracleV3Addr: string,
  block: number,
  api: ChainApi,
): Promise<Array<[token: string, priceFeed: string]>> {
  const [mainFeeds, reserveFeeds] = await Promise.all([
    getPriceFeeds(
      priceOracleV3Addr,
      "event SetPriceFeed(address indexed token, address indexed priceFeed, uint32 stalenessPeriod, bool skipCheck, bool trusted)",
      block,
      api,
    ),
    getPriceFeeds(
      priceOracleV3Addr,
      "event SetReservePriceFeed(address indexed token, address indexed priceFeed, uint32 stalenessPeriod, bool skipCheck)",
      block,
      api,
    ),
  ]);
  return [...mainFeeds, ...reserveFeeds];
}

async function getPriceFeedsForTokens(
  priceOracleV3Addr: string,
  tokens: string[],
  block: number,
  api: ChainApi,
): Promise<Array<[token: string, priceFeed: string]>> {
  const feeds: string[] = await api.multiCall({
    abi: redstoneAbis["priceFeedsRaw"],
    calls: [
      ...tokens.map(t => ({
        target: priceOracleV3Addr,
        params: [t, false] as any,
      })),
      ...tokens.map(t => ({
        target: priceOracleV3Addr,
        params: [t, true] as any,
      })),
    ],
    permitFailure: true,
    block,
  });
  const result: Array<[token: string, priceFeed: string]> = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].toLowerCase();
    const [main, reserve] = [feeds[i], feeds[i + tokens.length]];
    if (main) {
      result.push([token, main.toLowerCase()]);
    }
    if (reserve) {
      result.push([token, reserve.toLowerCase()]);
    }
  }
  return result;
}

// async function updateRedstone(tokens: string[]): Promise<PriceOnDemand[]> {
//   const redstoneFeeds: Array<RedstonePriceFeed & { token: string }> = [];

//   for (const t of tokens) {
//     const token = t.toLowerCase();
//     const symbol = tokenSymbolByAddress[token];
//     if (!symbol) {
//       this.log?.warn(
//         `Failed price feed for token ${token} which is not found in SDK`,
//       );
//       continue;
//     }

//     const feed = priceFeedsByToken[symbol];
//     const entry = feed?.AllNetworks ?? feed?.Mainnet;
//     if (!entry) {
//       this.log?.warn(
//         `Cannot find price feed for token ${symbol} (${token}) in SDK`,
//       );
//       continue;
//     }
//     // it is technically possible to have both main and reserve price feeds to be redstone
//     // but from practical standpoint this makes no sense: so use else-if, not if-if
//     if (entry.Main?.type === PriceFeedType.REDSTONE_ORACLE) {
//       redstoneFeeds.push({ token, ...entry.Main });
//       this.log?.debug(
//         `need to update main redstone price feed ${entry.Main.dataId} in ${entry.Main.dataServiceId} for token ${symbol} (${token})`,
//       );
//     } else if (entry?.Reserve?.type === PriceFeedType.REDSTONE_ORACLE) {
//       redstoneFeeds.push({ token, ...entry.Reserve });
//       this.log?.debug(
//         `need to update reserve redstone price feed ${entry.Reserve.dataId} in ${entry.Reserve.dataServiceId} for token ${symbol} (${token})`,
//       );
//     } else {
//       this.log?.warn(
//         `non-restone price feed failed for token ${symbol} (${token}): ${JSON.stringify(
//           entry,
//         )}`,
//       );
//     }
//   }

//   const result = await Promise.all(
//     redstoneFeeds.map(f =>
//       getRedstonePayloadForManualUsage(
//         f.token,
//         f.dataServiceId,
//         f.dataId,
//         f.signersThreshold,
//       ),
//     ),
//   );

//   return result;
// }

// async function getRedstonePayloadForManualUsage(
//   token: string,
//   { dataServiceId, dataId, signersThreshold }: RedstonePriceFeed,
// ): Promise<PriceOnDemand> {
//   const dataPayload = await new DataServiceWrapper({
//     dataServiceId,
//     dataFeeds: [dataId],
//     uniqueSignersCount: signersThreshold,
//   }).prepareRedstonePayload(true);

//   const parser = new RedstonePayloadParser(getBytes(`0x${dataPayload}`));
//   const { signedDataPackages } = parser.parse();

//   let dataPackageIndex = 0;
//   let ts = 0;
//   for (const signedDataPackage of signedDataPackages) {
//     const newTimestamp =
//       signedDataPackage.dataPackage.timestampMilliseconds / 1000;

//     if (dataPackageIndex === 0) {
//       ts = newTimestamp;
//     } else if (ts !== newTimestamp) {
//       throw new Error("Timestamps are not equal");
//     }

//     ++dataPackageIndex;
//   }

//   const result = ethers.AbiCoder.defaultAbiCoder().encode(
//     ["uint256", "bytes"],
//     [ts, getBytes(`0x${dataPayload}`)],
//   );

//   return { token, callData: result };
// }
