export const v3Abis = {
  getAddressOrRevert:
    "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  getCreditManagersV3List:
    "function getCreditManagersV3List() view returns (tuple(address addr, string name, uint256 cfVersion, address creditFacade, address creditConfigurator, address underlying, address pool, uint256 totalDebt, uint256 totalDebtLimit, uint256 baseBorrowRate, uint256 minDebt, uint256 maxDebt, uint256 availableToBorrow, address[] collateralTokens, tuple(address targetContract, address adapter)[] adapters, uint256[] liquidationThresholds, bool isDegenMode, address degenNFT, uint256 forbiddenTokenMask, uint8 maxEnabledTokensLength, uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, uint16 feeLiquidationExpired, uint16 liquidationDiscountExpired, tuple(address token, uint16 rate, uint16 quotaIncreaseFee, uint96 totalQuoted, uint96 limit, bool isActive)[] quotas, tuple(address interestModel, uint256 version, uint16 U_1, uint16 U_2, uint16 R_base, uint16 R_slope1, uint16 R_slope2, uint16 R_slope3, bool isBorrowingMoreU2Forbidden) lirm, bool isPaused)[])",
  getCreditAccountsByCreditManager:
    "function getCreditAccountsByCreditManager(address creditManager, (address token, bytes callData)[] priceUpdates) returns ((bool isSuccessful, address[] priceFeedsNeeded, address addr, address borrower, address creditManager, string cmName, address creditFacade, address underlying, uint256 debt, uint256 cumulativeIndexLastUpdate, uint128 cumulativeQuotaInterest, uint256 accruedInterest, uint256 accruedFees, uint256 totalDebtUSD, uint256 totalValue, uint256 totalValueUSD, uint256 twvUSD, uint256 enabledTokensMask, uint256 healthFactor, uint256 baseBorrowRate, uint256 aggregatedBorrowRate, (address token, uint256 balance, bool isForbidden, bool isEnabled, bool isQuoted, uint256 quota, uint16 quotaRate, uint256 quotaCumulativeIndexLU)[] balances, uint64 since, uint256 cfVersion, uint40 expirationDate, address[] activeBots)[])",

  creditAccounts: "function creditAccounts() view returns (address[])",
  collateralTokensCount:
    "function collateralTokensCount() view returns (uint8)",
  getTokenByMask:
    "function getTokenByMask(uint256 tokenMask) view returns (address token)",
};
