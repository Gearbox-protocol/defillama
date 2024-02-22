export const redstoneAbis = {
  getAddressOrRevert:
    "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  dataFeedId: "function dataFeedId() external view returns (bytes32)",
  priceFeedsRaw:
    "function priceFeedsRaw(address token, bool reserve) external view returns (address)",
};
