import { BigNumber } from "@ethersproject/bignumber";
import type { SignedDataPackage } from "@redstone-finance/protocol";
import { RedstonePayload } from "@redstone-finance/protocol";
import {
  requestDataPackages,
  resolveDataServiceUrls,
} from "@redstone-finance/sdk";
import { AbiCoder, getBytes } from "ethers";

import type { PriceOnDemand, RedstonePriceFeed } from "./types";

// This constant is here solely to make bundler bundle BigNumber
// see tsup.mjs for more info
export const _makeBundlerIncludeBigNumber = BigNumber.from(0);

/**
 * This is bits of `DataServiceWrapper({...}).prepareRedstonePayload(true) extracted into single function to minimize bundled dependencies
 * https://github.com/redstone-finance/redstone-oracles-monorepo/blob/main/packages/evm-connector/src/wrappers/DataServiceWrapper.ts
 * @param data
 * @returns
 */
export async function getRedstonePayloadForManualUsage(
  token: string,
  feed: RedstonePriceFeed,
): Promise<PriceOnDemand> {
  const signedDataPackages = await getDataPackagesForPayload(feed);
  const dataPayload = await prepareRedstonePayload(
    signedDataPackages,
    feed.dataServiceId,
  );

  let dataPackageIndex = 0;
  let ts = 0;
  for (const signedDataPackage of signedDataPackages) {
    const newTimestamp =
      signedDataPackage.dataPackage.timestampMilliseconds / 1000;

    if (dataPackageIndex === 0) {
      ts = newTimestamp;
    } else if (ts !== newTimestamp) {
      throw new Error("Timestamps are not equal");
    }

    ++dataPackageIndex;
  }

  const result = AbiCoder.defaultAbiCoder().encode(
    ["uint256", "bytes"],
    [ts, getBytes(`0x${dataPayload}`)],
  );

  return { token, callData: result };
}

async function prepareRedstonePayload(
  signedDataPackages: SignedDataPackage[],
  dataServiceId: string,
): Promise<string> {
  let unsignedMetadata = getUnsignedMetadata(dataServiceId);

  const originalPayload = RedstonePayload.prepare(
    signedDataPackages,
    unsignedMetadata,
  );

  // Calculating the number of bytes in the hex representation of payload
  // We divide by 2, beacuse 2 symbols in a hex string represent one byte
  const originalPayloadLength = originalPayload.length / 2;

  // Number of bytes that we want to add to unsigned metadata so that
  // payload byte size becomes a multiplicity of 32
  const bytesToAdd = 32 - (originalPayloadLength % 32);

  // Adding underscores to the end of the metadata string, each underscore
  // uses one byte in UTF-8
  unsignedMetadata += "_".repeat(bytesToAdd);

  return RedstonePayload.prepare(signedDataPackages, unsignedMetadata);
}

async function getDataPackagesForPayload({
  dataServiceId,
  dataId,
  signersThreshold,
}: RedstonePriceFeed): Promise<SignedDataPackage[]> {
  const dpResponse = await requestDataPackages({
    dataServiceId,
    dataFeeds: [dataId],
    uniqueSignersCount: signersThreshold,
    urls: resolveDataServiceUrls(dataServiceId),
  });
  return Object.values(dpResponse).flat() as SignedDataPackage[];
}

function getUnsignedMetadata(dataServiceId: string): string {
  return `${Date.now()}#0.3.6#${dataServiceId}`;
}
