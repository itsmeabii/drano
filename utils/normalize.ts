import { TxForBalancesRow } from '@/types/dashboard'
import { Wallet } from '@/types/wallet'

export const normalizeWallets = (wallets: Wallet[]): Wallet[] =>
  wallets.map((w) => ({
    ...w,
    balance: Number(w.balance ?? 0),
    credit_limit: Number(w.credit_limit ?? 0),
    credit_used: Number(w.credit_used ?? 0),
    interest_rate: Number(w.interest_rate ?? 0),
  }))

export const normalizeTransactions = (tx: TxForBalancesRow[]): TxForBalancesRow[] =>
  tx.map((t) => ({
    ...t,
    amount: Number(t.amount),
    transfer_fee: Number(t.transfer_fee ?? 0),
  }))
