export interface CreditManagerData {
  addr: string;
  name: string;
  cfVersion: string;
  creditFacade: string;
  creditConfigurator: string;
  underlying: string;
  pool: string;
  totalDebt: string;
  totalDebtLimit: string;
  baseBorrowRate: string;
  minDebt: string;
  maxDebt: string;
  availableToBorrow: string;
  collateralTokens: string[];
  adapters: ContractAdapterData[];
  liquidationThresholds: string[];
  isDegenMode: boolean;
  degenNFT: string;
  forbiddenTokenMask: string;
  maxEnabledTokensLength: string;
  feeInterest: string;
  feeLiquidation: string;
  liquidationDiscount: string;
  feeLiquidationExpired: string;
  liquidationDiscountExpired: string;
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
  rate: string;
  quotaIncreaseFee: string;
  totalQuoted: string;
  limit: string;
  isActive: boolean;
}

export interface LinearModelData {
  interestModel: string;
  version: string;
  U_1: string;
  U_2: string;
  R_base: string;
  R_slope1: string;
  R_slope2: string;
  R_slope3: string;
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
  debt: string;
  cumulativeIndexLastUpdate: string;
  cumulativeQuotaInterest: string;
  accruedInterest: string;
  accruedFees: string;
  totalDebtUSD: string;
  totalValue: string;
  totalValueUSD: string;
  twvUSD: string;
  enabledTokensMask: string;
  healthFactor: string;
  baseBorrowRate: string;
  aggregatedBorrowRate: string;
  balances: TokenBalance[];
  since: string;
  cfVersion: string;
  expirationDate: string;
  activeBots: string[];
}

export interface TokenBalance {
  token: string;
  balance: string;
  isForbidden: boolean;
  isEnabled: boolean;
  isQuoted: boolean;
  quota: string;
  quotaRate: string;
  quotaCumulativeIndexLU: string;
}

export interface TokenAndOwner {
  addr: string;
  token: string;
  bal: string;
}
