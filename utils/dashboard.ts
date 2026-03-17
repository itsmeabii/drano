import { createClient } from '@/lib/supabase/server'
import { applyTransactionsToWallets } from '@/utils/walletMath'

type DashboardWalletRow = {
  id: string
  name: string
  type: string
  balance: number | string | null
  credit_limit?: number | string | null
  credit_used?: number | string | null
  interest_rate?: number | string | null
  icon?: string | null
  color?: string | null
}

type TxForBalancesRow = {
  type: 'expense' | 'income' | 'transfer'
  wallet_id: string
  to_wallet_id: string | null
  amount: number | string
  transfer_fee: number | string | null
  date: string
}

const n = (v: unknown) => {
  const num = typeof v === 'number' ? v : parseFloat(String(v ?? 0))
  return Number.isFinite(num) ? num : 0
}

export async function getDashboardData() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startStr = startOfMonth.toISOString().split('T')[0]

  const [walletsRes, recentTxRes, monthTxRes, balancesTxRes] = await Promise.all([
    supabase.from('wallets').select('*').order('created_at', { ascending: true }),
    supabase.from('transactions').select('*').order('date', { ascending: false }).limit(5),
    supabase
      .from('transactions')
      .select('type, amount, date')
      .gte('date', startStr)
      .order('date', { ascending: false }),
    supabase
      .from('transactions')
      .select('type, wallet_id, to_wallet_id, amount, transfer_fee, date')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const baseWallets = (walletsRes.data ?? []) as DashboardWalletRow[]
  const computedWallets = applyTransactionsToWallets<DashboardWalletRow>(
    baseWallets,
    (balancesTxRes.data ?? []) as TxForBalancesRow[]
  )

  const totalBalance = computedWallets.reduce((sum, w) => sum + n(w.balance), 0)

  const spendableBalance = computedWallets
    .filter((w) => w.type !== 'savings' && w.type !== 'credit')
    .reduce((sum, w) => sum + n(w.balance), 0)

  const savingsBalance = computedWallets
    .filter((w) => w.type === 'savings')
    .reduce((sum, w) => sum + n(w.balance), 0)

  const monthlyTransactions = monthTxRes.data ?? []
  const income = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + n(t.amount), 0)
  const expenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + n(t.amount), 0)

  return {
    totalBalance,
    spendableBalance,
    savingsBalance,
    income,
    expenses,
    recentTransactions: recentTxRes.data ?? [],
    wallets: computedWallets,
  }
}
