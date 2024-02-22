export const v1Abis = {
  getAddressOrRevert:
    "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  getCreditManagers: "function getCreditManagers() view returns (address[])",
  version: "function version() view returns (uint256)",
  underlyingToken: "function underlyingToken() view returns (address)",
  calcTotalValue:
    "function calcTotalValue(address creditAccount) view returns (uint256 total)",
  filtersV1: [
    "event CloseCreditAccount(address indexed owner, address indexed to, uint256 remainingFunds)",
    "event OpenCreditAccount(address indexed sender, address indexed onBehalfOf, address indexed creditAccount, uint256 amount, uint256 borrowAmount, uint256 referralCode)",
    "event RepayCreditAccount(address indexed owner, address indexed to)",
    "event TransferAccount(address indexed oldOwner, address indexed newOwner)",
    "event LiquidateCreditAccount(address indexed owner, address indexed liquidator, uint256 remainingFunds)",
  ],
  creditFilter: "function creditFilter() view returns (address addr)",
};
