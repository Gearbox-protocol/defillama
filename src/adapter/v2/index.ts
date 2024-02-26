import type { ChainApi } from "@defillama/sdk";
import { Contract } from "ethers";

import { ADDRESS_PROVIDER_V3 } from "../constants";
// @ts-ignore
import { getLogs } from "../helper/cache/getLogs";
import { v2Abis } from "./abi";
import type {
  CreditAccountEvent,
  CreditManagerData,
  Log,
  ParsedLog,
  TokenAndOwner,
} from "./types";

export async function getV2TVL(
  block: number,
  api: ChainApi,
): Promise<TokenAndOwner[]> {
  // Get Current CMs
  const creditManagers = await getCreditManagersV210(block, api);
  // Silently throw if no V2 CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map(cm => getV2CAs(cm.addr, block, api)),
  );

  return creditManagers.map((cm, i) => ({
    addr: cm.addr,
    token: cm.underlying,
    bal: caValues[i],
  }));
}

async function getCreditManagersV210(
  block: number,
  api: ChainApi,
): Promise<CreditManagerData[]> {
  const dataCompressor210: string = await api.call({
    abi: v2Abis["getAddressOrRevert"],
    target: ADDRESS_PROVIDER_V3,
    params: [
      // cast format-bytes32-string "DATA_COMPRESSOR"
      "0x444154415f434f4d50524553534f520000000000000000000000000000000000",
      210,
    ],
    block,
  });
  return api.call({
    // IDataCompressorV2_10__factory.createInterface().getFunction("getCreditManagersV2List").format(ethers.utils.FormatTypes.full)
    abi: v2Abis["getCreditManagersV2List"],
    target: dataCompressor210,
    block,
  });
}

async function getV2CAs(
  creditManager: string,
  block: number,
  api: ChainApi,
): Promise<string> {
  const fromBlock = 13854983;
  const eventsByDate: CreditAccountEvent[] = [];
  const accounts = new Set<string>();

  const creditFacade = await api.call({
    abi: v2Abis["creditFacade"],
    target: creditManager,
    block,
  });

  const ccLogs: Array<[string]> = await getLogs({
    target: creditManager,
    fromBlock,
    toBlock: block,
    api,
    onlyArgs: true,
    eventAbi: "event NewConfigurator(address indexed newConfigurator)",
  });
  const ccAddrs = ccLogs.map(l => l[0]);

  const cfAddrs: string[] = [];

  for (let cca of ccAddrs) {
    const cfLogs: Array<[string]> = await getLogs({
      target: cca,
      fromBlock,
      api,
      onlyArgs: true,
      eventAbi: "event CreditFacadeUpgraded(address indexed newCreditFacade)",
    });
    const cfs = cfLogs.map(l => l[0]);
    cfAddrs.push(...cfs);
  }

  const addToEvents = (
    e: ParsedLog,
    address: string,
    operation: CreditAccountEvent["operation"],
  ) => {
    eventsByDate.push({
      time: e.blockNumber * 100000 + e.logIndex,
      address,
      operation,
      ca: e.args.creditAccount ? e.args.creditAccount : null,
      cf: creditFacade,
    });
  };

  const logs: ParsedLog[] = [];

  for (let cfAddr of cfAddrs) {
    const cf = new Contract(cfAddr, v2Abis["filtersV2"]);
    const topics: string[] = [];
    cf.interface.forEachEvent(e => topics.push(e.topicHash));
    const rawLogs: Log[] = await getLogs({
      target: cfAddr,
      fromBlock,
      api,
      topics: [topics],
    });

    const cfLogs: ParsedLog[] = rawLogs.map(log => ({
      ...(cf.interface.parseLog(log) as any),
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
    }));

    logs.push(...cfLogs);
  }

  logs.forEach(log => {
    switch (log.name) {
      case "OpenCreditAccount":
        addToEvents(log, log.args.onBehalfOf, "add");
        break;
      case "CloseCreditAccount":
      case "LiquidateCreditAccount":
      case "LiquidateExpiredCreditAccount":
        addToEvents(log, log.args.borrower, "delete");
        break;
      case "TransferAccount":
        addToEvents(log, log.args.oldOwner, "delete");
        addToEvents(log, log.args.newOwner, "add");
        break;
    }
  });

  eventsByDate
    .sort((a, b) => {
      return a.time - b.time;
    })
    .forEach(e => {
      if (e.operation === "add") {
        accounts.add(e.address);
      } else {
        accounts.delete(e.address);
      }
    });

  const openCAs: string[] = Array.from(accounts.values()).map(
    borrower =>
      logs
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .find(log => log.args?.onBehalfOf === borrower)!.args.creditAccount,
  );

  const totalValue = await api.multiCall({
    abi: v2Abis["calcTotalValue"],
    target: creditFacade,
    calls: openCAs,
  });

  return totalValue[0]
    ? totalValue.reduce((a, c) => a + BigInt(c), BigInt(0)).toString()
    : "0";
}
