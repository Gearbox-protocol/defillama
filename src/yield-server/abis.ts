export default {
  getPoolsV1List: {
    inputs: [],
    name: "getPoolsV1List",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "address",
            name: "underlying",
            type: "address",
          },
          {
            internalType: "address",
            name: "dieselToken",
            type: "address",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "baseInterestIndex",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableLiquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expectedLiquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalBorrowed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalDebtLimit",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "creditManager",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "borrowed",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "limit",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "availableToBorrow",
                type: "uint256",
              },
            ],
            internalType: "struct CreditManagerDebtParams[]",
            name: "creditManagerDebtParams",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "totalAssets",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalSupply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supplyRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "baseInterestRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dieselRate_RAY",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "withdrawFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastBaseInterestUpdate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "baseInterestIndexLU",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "version",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "poolQuotaKeeper",
            type: "address",
          },
          {
            internalType: "address",
            name: "gauge",
            type: "address",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint16",
                name: "rate",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "quotaIncreaseFee",
                type: "uint16",
              },
              {
                internalType: "uint96",
                name: "totalQuoted",
                type: "uint96",
              },
              {
                internalType: "uint96",
                name: "limit",
                type: "uint96",
              },
              {
                internalType: "bool",
                name: "isActive",
                type: "bool",
              },
            ],
            internalType: "struct QuotaInfo[]",
            name: "quotas",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "zapper",
                type: "address",
              },
              {
                internalType: "address",
                name: "tokenIn",
                type: "address",
              },
              {
                internalType: "address",
                name: "tokenOut",
                type: "address",
              },
            ],
            internalType: "struct ZapperInfo[]",
            name: "zappers",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "interestModel",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "version",
                type: "uint256",
              },
              {
                internalType: "uint16",
                name: "U_1",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "U_2",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "R_base",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "R_slope1",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "R_slope2",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "R_slope3",
                type: "uint16",
              },
              {
                internalType: "bool",
                name: "isBorrowingMoreU2Forbidden",
                type: "bool",
              },
            ],
            internalType: "struct LinearModel",
            name: "lirm",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isPaused",
            type: "bool",
          },
        ],
        internalType: "struct PoolData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  getPoolsV3List: {
    inputs: [],
    name: "getPoolsV3List",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "address",
            name: "underlying",
            type: "address",
          },
          {
            internalType: "address",
            name: "dieselToken",
            type: "address",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "baseInterestIndex",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableLiquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expectedLiquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalBorrowed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalDebtLimit",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "creditManager",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "borrowed",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "limit",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "availableToBorrow",
                type: "uint256",
              },
            ],
            internalType: "struct CreditManagerDebtParams[]",
            name: "creditManagerDebtParams",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "totalAssets",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalSupply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supplyRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "baseInterestRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dieselRate_RAY",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "withdrawFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastBaseInterestUpdate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "baseInterestIndexLU",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "version",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "poolQuotaKeeper",
            type: "address",
          },
          {
            internalType: "address",
            name: "gauge",
            type: "address",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint16",
                name: "rate",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "quotaIncreaseFee",
                type: "uint16",
              },
              {
                internalType: "uint96",
                name: "totalQuoted",
                type: "uint96",
              },
              {
                internalType: "uint96",
                name: "limit",
                type: "uint96",
              },
              {
                internalType: "bool",
                name: "isActive",
                type: "bool",
              },
            ],
            internalType: "struct QuotaInfo[]",
            name: "quotas",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "zapper",
                type: "address",
              },
              {
                internalType: "address",
                name: "tokenIn",
                type: "address",
              },
              {
                internalType: "address",
                name: "tokenOut",
                type: "address",
              },
            ],
            internalType: "struct ZapperInfo[]",
            name: "zappers",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "interestModel",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "version",
                type: "uint256",
              },
              {
                internalType: "uint16",
                name: "U_1",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "U_2",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "R_base",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "R_slope1",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "R_slope2",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "R_slope3",
                type: "uint16",
              },
              {
                internalType: "bool",
                name: "isBorrowingMoreU2Forbidden",
                type: "bool",
              },
            ],
            internalType: "struct LinearModel",
            name: "lirm",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isPaused",
            type: "bool",
          },
        ],
        internalType: "struct PoolData[]",
        name: "result",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  farmInfo: {
    inputs: [],
    name: "farmInfo",
    outputs: [
      {
        components: [
          {
            internalType: "uint40",
            name: "finished",
            type: "uint40",
          },
          {
            internalType: "uint32",
            name: "duration",
            type: "uint32",
          },
          {
            internalType: "uint184",
            name: "reward",
            type: "uint184",
          },
          {
            internalType: "uint256",
            name: "balance",
            type: "uint256",
          },
        ],
        internalType: "struct FarmAccounting.Info",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  symbol: "function symbol() external view returns (string)",
  totalSupply: "function totalSupply() external view returns (uint256)",
  stakingToken: "function stakingToken() external view returns (address)",
  decimals: "function decimals() external view returns (uint8)",
  fees: "function fees() external view returns (uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, uint16 feeLiquidationExpired, uint16 liquidationDiscountExpired)",
  getCreditManagers:
    "function getCreditManagers() external view returns (address[])",
  pool: "function pool() external view returns (address)",
  getAddressOrRevert:
    "function getAddressOrRevert(bytes32 key, uint256 version) view returns (address result)",
};
