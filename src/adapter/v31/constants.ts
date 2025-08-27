/**
 * Market configurators that are not present in Market Configurator Factory
 */
export const LEGACY_MARKET_CONFIGURATORS: Record<string, string[]> = {
  ethereum: [
    "0x354fe9f450F60b8547f88BE042E4A45b46128a06", // Chaos Labs
    "0x4d427D418342d8CE89a7634c3a402851978B680A", // K3
  ],
  arbitrum: [
    "0x01023850b360b88de0d0f84015bbba1eba57fe7e", // "Chaos Labs",
  ],
  optimism: [
    "0x2a15969CE5320868eb609680751cF8896DD92De5", // "Chaos Labs",
  ],
  sonic: [
    "0x8FFDd1F1433674516f83645a768E8900A2A5D076", // "Chaos Labs",
  ],
};

export const DEFILLAMA_COMPRESSOR_V310 =
  "0x81cb9eA2d59414Ab13ec0567EFB09767Ddbe897a";
