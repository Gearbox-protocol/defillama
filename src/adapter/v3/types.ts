import type { TokenBalanceStructOutput } from "../../../../deploy-v3/types/DataCompressorV3";
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

export interface CreditAccountData {
  isSuccessful: boolean;
  priceFeedsNeeded: string[];
  addr: string;
  borrower: string;
  creditManager: string;
  cmName: string;
  creditFacade: string;
  underlying: string;
  debt: bigint;
  cumulativeIndexLastUpdate: bigint;
  cumulativeQuotaInterest: bigint;
  accruedInterest: bigint;
  accruedFees: bigint;
  totalDebtUSD: bigint;
  totalValue: bigint;
  totalValueUSD: bigint;
  twvUSD: bigint;
  enabledTokensMask: bigint;
  healthFactor: bigint;
  baseBorrowRate: bigint;
  aggregatedBorrowRate: bigint;
  balances: TokenBalance[];
  since: bigint;
  cfVersion: bigint;
  expirationDate: bigint;
  activeBots: string[];
}

export interface TokenBalance {
  token: string;
  balance: bigint;
  isForbidden: boolean;
  isEnabled: boolean;
  isQuoted: boolean;
  quota: bigint;
  quotaRate: bigint;
  quotaCumulativeIndexLU: bigint;
}
