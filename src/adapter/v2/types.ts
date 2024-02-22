import type { LogDescription } from "ethers";

export interface CreditManagerData {
  addr: string;
  name: string;
  cfVersion: bigint;
  creditFacade: string;
  creditConfigurator: string;
  underlying: string;
  pool: string;
  totalDebt: bigint;
  totalDebtLimit: bigint;
  baseBorrowRate: bigint;
  minDebt: bigint;
  maxDebt: bigint;
  availableToBorrow: bigint;
  collateralTokens: string[];
  adapters: ContractAdapterData[];
  liquidationThresholds: bigint[];
  isDegenMode: boolean;
  degenNFT: string;
  forbiddenTokenMask: bigint;
  maxEnabledTokensLength: bigint;
  feeInterest: bigint;
  feeLiquidation: bigint;
  liquidationDiscount: bigint;
  feeLiquidationExpired: bigint;
  liquidationDiscountExpired: bigint;
  quotas: QuotaInfoData[];
  lirm: LinearModelData;
  isPaused: boolean;
}

export interface ContractAdapterData {
  targetContract: string;
  adapter: string;
}

export interface QuotaInfoData {
  token: string;
  rate: bigint;
  quotaIncreaseFee: bigint;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
}

export interface LinearModelData {
  interestModel: string;
  version: bigint;
  U_1: bigint;
  U_2: bigint;
  R_base: bigint;
  R_slope1: bigint;
  R_slope2: bigint;
  R_slope3: bigint;
  isBorrowingMoreU2Forbidden: boolean;
}

export interface Log {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  removed: boolean;
  address: string;
  data: string;
  topics: string[];
  transactionHash: string;
  logIndex: number;
}

export interface ParsedLog extends LogDescription {
  blockNumber: number;
  logIndex: number;
}

export interface CreditAccountEvent {
  time: number;
  address: string;
  operation: "add" | "delete";
  ca: string | null;
  cf: string;
}
