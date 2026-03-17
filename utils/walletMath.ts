export type WalletType = 'cash' | 'debit' | 'credit' | 'savings' | string

export interface WalletMathWallet {
  id: string
  type: WalletType
  balance: number | string | null
  credit_used?: number | string | null
  credit_limit?: number | string | null
  interest_rate?: number | string | null
}

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

/**
 * Computes "live" wallet fields from transactions.
 *
 * - For non-credit wallets: `balance = opening_balance + netTransactions`
 * - For credit wallets: treat ledger balance as cash-like (charges make it negative)
 *   and display:
 *     - `balance` as "amount owed" (positive)
 *     - `credit_used` as "amount owed" (positive)
 */
export function applyTransactionsToWallets<TWallet extends WalletMathWallet>(
  wallets: TWallet[],
  transactions: WalletMathTransaction[]
): Array<
  TWallet & {
    opening_balance: number
    ledger_balance: number
  }
> {
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
      add(deltas, tx.wallet_id, -(amount + fee))
      if (tx.to_wallet_id) add(deltas, tx.to_wallet_id, amount)
    }
  }

  return wallets.map((w) => {
    if (w.type === 'credit') {
      // For credit wallets, treat the stored "balance" as starting amount owed.
      // Internally we keep a cash-like ledger where debt is negative.
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
