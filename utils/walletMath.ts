import { Wallet } from '@/types/wallet'

export type WalletType = 'cash' | 'debit' | 'credit' | 'savings' | string
export type WalletMathWallet = Wallet

export interface WalletMathTransaction {
  type: 'expense' | 'income' | 'transfer'
  wallet_id: string
  to_wallet_id: string | null
  amount: number | string
  transfer_fee?: number | string | null
  date?: string
}

const n = (v: unknown) => {
  const num = typeof v === 'number' ? v : parseFloat(String(v ?? 0))
  return Number.isFinite(num) ? num : 0
}

function add(map: Map<string, number>, id: string, delta: number) {
  map.set(id, (map.get(id) ?? 0) + delta)
}

export function applyTransactionsToWallets<TWallet extends WalletMathWallet>(
  wallets: TWallet[],
  transactions: WalletMathTransaction[]
) {
  const deltas = new Map<string, number>()

  for (const tx of transactions) {
    const amount = n(tx.amount)
    const fee = n(tx.transfer_fee)

    if (!tx.wallet_id) continue

    if (tx.type === 'income') {
      add(deltas, tx.wallet_id, amount)
      continue
    }

    if (tx.type === 'expense') {
      add(deltas, tx.wallet_id, -amount)
      continue
    }

    if (tx.type === 'transfer') {
      const origin = wallets.find((w) => w.id === tx.wallet_id)
      const destination = wallets.find((w) => w.id === tx.to_wallet_id)

      if (origin && destination) {
        origin.balance -= n(tx.amount) + fee
        destination.balance += n(tx.amount)
      }
    }
  }

  return wallets.map((w) => {
    if (w.type === 'credit') {
      const opening = -Math.abs(n(w.balance))
      const ledger = opening + (deltas.get(w.id) ?? 0)
      const owed = Math.max(0, -ledger)
      return {
        ...w,
        opening_balance: opening,
        ledger_balance: ledger,
        balance: owed,
        credit_used: owed,
        credit_limit: n(w.credit_limit),
        interest_rate: n(w.interest_rate),
      }
    }

    const opening = n(w.balance)
    const ledger = opening + (deltas.get(w.id) ?? 0)
    return {
      ...w,
      opening_balance: opening,
      ledger_balance: ledger,
      balance: ledger,
      credit_used: n(w.credit_used),
      credit_limit: n(w.credit_limit),
      interest_rate: n(w.interest_rate),
    }
  })
}
