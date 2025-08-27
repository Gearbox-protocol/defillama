import type { DefillamaCreditAccountData, TokenAndOwner } from "./types";

export function unique(arr: string[]): string[] {
  return [...new Set(arr.map(i => i.toLowerCase()))];
}

export function mergePools(
  a: TokenAndOwner[],
  b: TokenAndOwner[],
): TokenAndOwner[] {
  const pools = a.map(p => p.addr.toLowerCase());
  return [...a, ...b.filter(p => !pools.includes(p.addr.toLowerCase()))];
}

export function accountToTokenAndOwner(
  account: DefillamaCreditAccountData,
): TokenAndOwner[] {
  return account.tokens
    .filter(t => BigInt(t.balance) > 1n)
    .map(t => ({
      addr: account.creditAccount.toLowerCase(),
      token: t.token.toLowerCase(),
      bal: t.balance,
    }));
}
