export const v2Abis = {
  calcTotalValue:
    "function calcTotalValue(address creditAccount) view returns (uint256 total)",
  getAddressOrRevert:
    "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  getCreditManagersV2List:
    "function getCreditManagersV2List() view returns (tuple(address addr, string name, uint256 cfVersion, address creditFacade, address creditConfigurator, address underlying, address pool, uint256 totalDebt, uint256 totalDebtLimit, uint256 baseBorrowRate, uint256 minDebt, uint256 maxDebt, uint256 availableToBorrow, address[] collateralTokens, tuple(address targetContract, address adapter)[] adapters, uint256[] liquidationThresholds, bool isDegenMode, address degenNFT, uint256 forbiddenTokenMask, uint8 maxEnabledTokensLength, uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, uint16 feeLiquidationExpired, uint16 liquidationDiscountExpired, tuple(address token, uint16 rate, uint16 quotaIncreaseFee, uint96 totalQuoted, uint96 limit, bool isActive)[] quotas, tuple(address interestModel, uint256 version, uint16 U_1, uint16 U_2, uint16 R_base, uint16 R_slope1, uint16 R_slope2, uint16 R_slope3, bool isBorrowingMoreU2Forbidden) lirm, bool isPaused)[])",
  creditFacade: "function creditFacade() view returns (address addr)",
  filtersV2: [
    "event OpenCreditAccount(address indexed onBehalfOf, address indexed creditAccount, uint256 borrowAmount, uint16 referralCode)",
    "event CloseCreditAccount(address indexed borrower, address indexed to)",
    "event LiquidateCreditAccount(address indexed borrower, address indexed liquidator, address indexed to, uint256 remainingFunds)",
    "event TransferAccount(address indexed oldOwner, address indexed newOwner)",
    "event LiquidateExpiredCreditAccount(address indexed borrower, address indexed liquidator, address indexed to, uint256 remainingFunds)",
  ],
};
