export interface Log {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  removed: boolean;
  address: string;
  data: string;
  topics: string[];
  transactionHash: string;
  logIndex: number;
}

export interface CreditAccountEvent {
  time: number;
  address: string;
  operation: "add" | "delete";
}

export interface CreditManagerData {
  addr: string;
  underlying: string;
}

export interface TokenAndOwner {
  addr: string;
  token: string;
  bal: string;
}
