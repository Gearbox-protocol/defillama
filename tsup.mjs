import { copyFile, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { build } from "tsup";

const VERSION = process.argv[2] ?? "dev";

const BANNER = `/**
 **
 **
 **
 ** This file has been generated from source code in https://github.com/Gearbox-protocol/defillama repo
 ** Binary release: https://github.com/Gearbox-protocol/defillama/releases/tag/v${VERSION}
 **
 **
 **
 **/`;

/**
 * For some reason, esbuild banner is not on top of the file
 */
async function addBanner(file) {
  const content = await readFile(file, "utf-8");
  await writeFile(
    file,
    content.replace("'use strict';", "'use strict';\n" + BANNER),
    "utf-8",
  );
}

const ethersLibUtilsV5Shim = {
  name: "ethersLibUtilsV5Shim",
  setup(build) {
    build.onResolve({ filter: /^ethers/ }, async args => {
      // ethers v5 is required by redstone, but is not available in defillama
      // reconstruct V5 ethers/lib/utils using methods from ethers V6
      if (args.path === "ethers/lib/utils") {
        const result = await build.resolve("./ethers-v5-lib-utils-shim.ts", {
          kind: "import-statement",
          resolveDir: resolve(process.cwd(), "src/redstone-lib"),
        });
        if (result.errors.length > 0) {
          return { errors: result.errors };
        }
        return { path: result.path, external: false };
      }
      if (args.path === "ethers") {
        return { path: args.path, external: true };
      }
      return { errors: "unknown path" };
    });
  },
};

await build({
  entry: ["src/redstone-lib/index.ts"],
  outDir: "dist/redstone-lib",
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  target: "node18",
  external: ["axios", "bignumber.js", "bn.js"],
  esbuildPlugins: [ethersLibUtilsV5Shim],
  metafile: true,
});

const REDSTONE_LIB = "dist/redstone-lib/index.js";

// Redstone will use `import {BigNumber} from "ethers"`
// this does not work with ethers-6 in defillama
// Following replacement allows redstone to use BigNumber from `@ethersproject/bignumber`, which is available thanks to magic _makeBundlerIncludeBigNumber contant
let redstoneLibContent = await readFile(REDSTONE_LIB, "utf-8");
redstoneLibContent = redstoneLibContent
  .replaceAll("ethers.BigNumber", "BigNumber")
  .replaceAll("ethers_1.BigNumber", "BigNumber");
await writeFile(REDSTONE_LIB, redstoneLibContent, "utf-8");
await addBanner(REDSTONE_LIB);

await build({
  entry: ["src/adapter/index.ts"],
  outDir: "dist/adapter",
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  target: "node18",
  external: [
    "../helper/cache/getLogs",
    "./redstone-lib",
    "ethers",
    "@defillama/sdk",
  ],
});
await addBanner("dist/adapter/index.js");

await copyFile(REDSTONE_LIB, "dist/adapter/redstone-lib.js");
await rm(dirname(REDSTONE_LIB), { force: true, recursive: true });
