/**
 * Strings that have numeric values that can be bigint
 */
export type BigNumberish = string;

/**
 * Floating point numbers from defillama
 */
export type Float = number;

/**
 * Integer numbers from defillama
 */
export type Integer = number;

export type Address = `0x${string}`;

export interface LlamaCoins {
  coins: Record<string, LlamaCoin>;
}

export interface LlamaCoin {
  decimals: Integer;
  symbol: string;
  price: Float;
  timestamp: Integer;
  confidence: Float;
}

export interface Fees {
  feeInterest: BigNumberish;
  feeLiquidation: BigNumberish;
  liquidationDiscount: BigNumberish;
  feeLiquidationExpired: BigNumberish;
  liquidationDiscountExpired: BigNumberish;
}

export interface FarmInfo<TNumberish> {
  finished: TNumberish;
  duration: TNumberish;
  reward: TNumberish;
  balance: TNumberish;
}

export interface FarmingPoolData {
  stakedDieselToken: Address;
  stakedDieselTokenSupply: bigint;
  farmInfo: FarmInfo<bigint>;
}

export interface CreditManagerDebtParams {
  creditManager: Address;
  borrowed: BigNumberish;
  limit: BigNumberish;
  availableToBorrow: BigNumberish;
}

export interface QuotaInfo {
  token: Address;
  rate: number;
  quotaIncreaseFee: number;
  totalQuoted: BigNumberish;
  limit: BigNumberish;
  isActive: boolean;
}

export interface ZapperInfo {
  zapper: Address;
  tokenIn: Address;
  tokenOut: Address;
}

export interface LinearModel {
  interestModel: string;
  version: BigNumberish;
  U_1: number;
  U_2: number;
  R_base: number;
  R_slope1: number;
  R_slope2: number;
  R_slope3: number;
  isBorrowingMoreU2Forbidden: boolean;
}

export interface PoolDataV3 {
  addr: Address;
  underlying: Address;
  dieselToken: Address;
  symbol: string;
  name: string;
  baseInterestIndex: BigNumberish;
  availableLiquidity: BigNumberish;
  expectedLiquidity: BigNumberish;
  totalBorrowed: BigNumberish;
  totalDebtLimit: BigNumberish;
  creditManagerDebtParams: CreditManagerDebtParams[];
  totalAssets: BigNumberish;
  totalSupply: BigNumberish;
  supplyRate: BigNumberish;
  baseInterestRate: BigNumberish;
  dieselRate_RAY: BigNumberish;
  withdrawFee: BigNumberish;
  lastBaseInterestUpdate: BigNumberish;
  baseInterestIndexLU: BigNumberish;
  version: BigNumberish;
  poolQuotaKeeper: Address;
  gauge: Address;
  quotas: QuotaInfo[];
  zappers: ZapperInfo[];
  lirm: LinearModel;
  isPaused: boolean;
}

export interface PoolInfoV3 extends FarmingPoolData {
  pool: Address;
  name: string;
  availableLiquidity: bigint;
  totalBorrowed: bigint;
  supplyRate: bigint;
  baseInterestRate: bigint;
  dieselRate: bigint;
  underlying: Address;
  withdrawFee: bigint;
  symbol: string;
  decimals: bigint;
}

export interface UnderlyingData {
  symbol: string;
  decimals: bigint;
  price: bigint;
}

export interface SupplyInfo {
  amount: bigint;
  decimals: bigint;
  price: bigint;
}
