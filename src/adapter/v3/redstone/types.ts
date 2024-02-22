export interface PriceOnDemand {
  token: string;
  callData: string;
}

export interface RedstoneData {
  priceFeed: string;
  dataServiceId: string;
  dataId: string;
}

export interface RedstonePriceFeed {
  dataServiceId: string;
  dataId: string;
  signersThreshold: number;
  historicalTimestamp?: number;
}

export type SetPriceFeedArgs = [
  to: string,
  priceFeed: string,
  stalenessPeriod: bigint,
  skipCheck: boolean,
];
