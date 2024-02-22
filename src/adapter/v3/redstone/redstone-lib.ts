import type { PriceOnDemand, RedstonePriceFeed } from "./types";

export declare function getRedstonePayloadForManualUsage(
  token: string,
  { dataServiceId, dataId, signersThreshold }: RedstonePriceFeed,
): Promise<PriceOnDemand>;
