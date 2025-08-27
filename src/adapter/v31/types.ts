export interface DefillamaCreditAccountData {
  creditAccount: string;
  debt: string;
  tokens: DefillamaTokenInfo[];
}

export interface DefillamaTokenInfo {
  token: string;
  balance: string;
}

export interface DefillamaPoolData {
  pool: string;
  underlying: string;
  availableLiquidity: string;
  totalBorrowed: string;
}

export interface TokenAndOwner {
  addr: string;
  token: string;
  bal: string;
}
