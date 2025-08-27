const iAddressProviderAbi = {
  getAddressOrRevert:
    "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
};

const iDefillamaCompressorAbi = {
  getLegacyCreditManagers:
    "function getCreditManagers(address[] memory configurators) external view returns (address[] memory creditManagers)",
  getCreditManagers:
    "function getCreditManagers() external view returns (address[] memory creditManagers)",
  getLegacyPools:
    "function getPools(address[] memory configurators) external view returns (tuple(address pool, address underlying, uint256 availableLiquidity, uint256 totalBorrowed)[] memory pools)",
  getPools:
    "function getPools() external view returns (tuple(address pool, address underlying, uint256 availableLiquidity, uint256 totalBorrowed)[] memory pools)",
  getCreditAccounts:
    "function getCreditAccounts(address creditManager, uint256 offset, uint256 limit) external view returns (tuple(address creditAccount, uint256 debt, tuple(address token, uint256 balance)[] tokens)[] memory data)",
};

export default {
  ...iAddressProviderAbi,
  ...iDefillamaCompressorAbi,
};
