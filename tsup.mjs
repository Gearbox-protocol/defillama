import { readFile, writeFile } from "node:fs/promises";

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
  await writeFile(file, content.replace("'use strict';", BANNER), "utf-8");
}

await build({
  entry: ["src/adapter/index.ts"],
  outDir: "dist/adapter",
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  target: "node18",
  external: ["../helper/cache/getLogs", "ethers", "@defillama/sdk"],
});
await addBanner("dist/adapter/index.js");
