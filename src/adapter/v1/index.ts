import type { ChainApi } from "@defillama/sdk";
import { Contract } from "ethers";

import { ADDRESS_PROVIDER_V3 } from "../constants";
// @ts-ignore
import { getLogs } from "../helper/cache/getLogs";
import { v1Abis } from "./abi";
import type { CreditAccountEvent, CreditManagerData, Log } from "./types";

export async function getV1TVL(block: number, api: ChainApi) {
  const creditManagers = await getCreditManagersV1(block, api);

  // Silently throw if no V1 CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map(cm => getV1CAs(cm.addr, block, api)),
  );

  return creditManagers.map((cm, i) => ({
    addr: cm.addr,
    token: cm.underlying,
    bal: caValues[i],
  }));
}

async function getCreditManagersV1(
  block: number,
  api: ChainApi,
): Promise<CreditManagerData[]> {
  const contractsRegisterAddr: string = await api.call({
    block,
    abi: v1Abis["getAddressOrRevert"],
    target: ADDRESS_PROVIDER_V3,
    params: [
      // cast format-bytes32-string "CONTRACTS_REGISTER"
      "0x434f4e5452414354535f52454749535445520000000000000000000000000000",
      0,
    ],
  });
  // Modern data compressors do not return v1 managers
  const creditManagers: string[] = await api.call({
    abi: v1Abis["getCreditManagers"],
    target: contractsRegisterAddr,
    block,
  });
  const versions: string[] = await api.multiCall({
    abi: v1Abis["version"],
    calls: creditManagers.map(target => ({ target })),
    block,
  });
  const v1Managers: string[] = [];
  for (let i = 0; i < creditManagers.length; i++) {
    const addr = creditManagers[i];
    const version = versions[i];
    if (version === "1") {
      v1Managers.push(addr);
    }
  }
  const underlyings: string[] = await api.multiCall({
    abi: v1Abis["underlyingToken"],
    calls: v1Managers.map(target => ({ target })),
    block,
  });
  return v1Managers.map((addr, i) => ({ addr, underlying: underlyings[i] }));
}

async function getV1CAs(
  creditManager: string,
  block: number,
  api: ChainApi,
): Promise<string> {
  if (creditManager === "0x4C6309fe2085EfE7A0Cfb426C16Ef3b41198cCE3") {
    return "0";
  }
  const eventsByDate: CreditAccountEvent[] = [];
  const accounts = new Set<string>();

  const addToEvents = (
    e: { blockNumber: number; logIndex: number },
    address: string,
    operation: CreditAccountEvent["operation"],
  ) => {
    eventsByDate.push({
      time: e.blockNumber * 100000 + e.logIndex,
      address,
      operation,
    });
  };

  const cf = await api.call({
    abi: v1Abis["creditFilter"],
    target: creditManager,
    block,
  });
  const cm = new Contract(creditManager, v1Abis["filtersV1"]);
  const topics: string[] = [];
  cm.interface.forEachEvent(e => topics.push(e.topicHash));

  const rawLogs: Log[] = await getLogs({
    skipCache: true,
    target: creditManager,
    fromBlock: 13854983,
    toBlock: block,
    api,
    topics: [topics],
  });

  const logs = rawLogs.map(log => ({
    ...cm.interface.parseLog(log),
    blockNumber: log.blockNumber,
    logIndex: log.logIndex,
  }));

  logs.forEach(log => {
    switch (log.name) {
      case "OpenCreditAccount":
        addToEvents(log, log.args!.onBehalfOf, "add");
        break;
      case "CloseCreditAccount":
      case "LiquidateCreditAccount":
      case "RepayCreditAccount":
        addToEvents(log, log.args!.borrower, "delete");
        break;
      case "TransferAccount":
        addToEvents(log, log.args!.oldOwner, "delete");
        addToEvents(log, log.args!.newOwner, "add");
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
      logs.find(log => log.args?.onBehalfOf === borrower)?.args!.creditAccount,
  );

  const totalValue = await api.multiCall({
    abi: v1Abis["calcTotalValue"],
    target: cf,
    calls: openCAs.filter(
      i => i !== "0xaBBd655b3791175113c1f1146D3B369494A2b815",
    ), // filtered out address throwing error
    block,
  });

  return totalValue.reduce((a, c) => a + BigInt(c), BigInt(0)).toString();
}
