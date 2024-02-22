export interface RedstonePriceFeed {
  dataServiceId: string;
  dataId: string;
  signersThreshold: number;
}

export interface PriceOnDemand {
  token: string;
  callData: string;
}
