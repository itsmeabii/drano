import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyTransactionsToWallets } from '@/utils/walletMath'
import {
  DashboardWalletRow,
  ProfileRow,
  RawTxRow,
  RawWalletRow,
  TxForBalancesRow,
  TxRecentRow,
} from '@/types/dashboard'

const n = (v: unknown) => {
  const num = typeof v === 'number' ? v : parseFloat(String(v ?? 0))
  return Number.isFinite(num) ? num : 0
}

export function useDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [displayName, setDisplayName] = useState('there')
  const [wallets, setWallets] = useState<DashboardWalletRow[]>([])
  const [recentTransactions, setRecentTransactions] = useState<TxRecentRow[]>([])
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)
  const [spendableBalance, setSpendableBalance] = useState(0)
  const [savingsBalance, setSavingsBalance] = useState(0)

  const normalizeWallets = (data: RawWalletRow[]): DashboardWalletRow[] =>
    data.map((w) => ({
      id: w.id,
      name: w.name,
      type: w.type,
      balance: n(w.balance),
      credit_used: n(w.credit_used),
      credit_limit: n(w.credit_limit),
      interest_rate: n(w.interest_rate),
      icon: w.icon ?? '',
      color: w.color ?? '#000000',
    }))

  const normalizeTx = (tx: RawTxRow): TxForBalancesRow => ({
    type: tx.type,
    wallet_id: tx.wallet_id,
    to_wallet_id: tx.to_wallet_id ?? null,
    amount: n(tx.amount),
    transfer_fee: n(tx.transfer_fee),
    date: tx.date,
  })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser()
        if (userErr) throw userErr
        if (!user) throw new Error('User not found')

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startStr = startOfMonth.toISOString().split('T')[0]

        const [profileRes, walletsRes, recentTxRes, monthTxRes, balancesTxRes] = await Promise.all([
          supabase.from('profiles').select('first_name, username').eq('id', user.id).single(),
          supabase.from('wallets').select('*').order('created_at', { ascending: true }),
          supabase
            .from('transactions')
            .select('id, name, note, type, amount, date')
            .order('date', { ascending: false })
            .limit(5),
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

        if (profileRes.error) throw profileRes.error
        if (walletsRes.error) throw walletsRes.error
        if (recentTxRes.error) throw recentTxRes.error
        if (monthTxRes.error) throw monthTxRes.error
        if (balancesTxRes.error) throw balancesTxRes.error

        const profile = profileRes.data as ProfileRow | null
        const name = profile?.first_name ?? profile?.username ?? 'there'

        const normalizedWallets = normalizeWallets(walletsRes.data ?? [])
        const computedWallets = applyTransactionsToWallets<DashboardWalletRow>(
          normalizedWallets,
          (balancesTxRes.data ?? []).map(normalizeTx)
        )

        const total = computedWallets.reduce((sum, w) => sum + w.balance, 0)
        const spendable = computedWallets
          .filter((w) => w.type !== 'savings' && w.type !== 'credit')
          .reduce((sum, w) => sum + w.balance, 0)
        const savings = computedWallets
          .filter((w) => w.type === 'savings')
          .reduce((sum, w) => sum + w.balance, 0)

        const monthTx = monthTxRes.data ?? []
        const inc = monthTx
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + n(t.amount), 0)
        const exp = monthTx
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + n(t.amount), 0)

        if (cancelled) return

        setDisplayName(name)
        setWallets(computedWallets)
        setRecentTransactions(recentTxRes.data ?? [])
        setIncome(inc)
        setExpenses(exp)
        setTotalBalance(total)
        setSpendableBalance(spendable)
        setSavingsBalance(savings)
      } catch (e: unknown) {
        console.error('useDashboard error:', e)
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Something went wrong')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [supabase])

  return {
    loading,
    error,
    displayName,
    wallets,
    recentTransactions,
    income,
    expenses,
    totalBalance,
    spendableBalance,
    savingsBalance,
  }
}
