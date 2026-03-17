import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyTransactionsToWallets } from '@/utils/walletMath'

type ProfileRow = {
  first_name: string | null
  username: string | null
}

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

type TxRecentRow = {
  id: string
  name: string
  note: string | null
  type: 'expense' | 'income' | 'transfer'
  amount: number | string
  date: string
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

        const profile = (profileRes.data ?? null) as ProfileRow | null
        const name = profile?.first_name ?? profile?.username ?? 'there'

        const baseWallets = (walletsRes.data ?? []) as DashboardWalletRow[]
        const computedWallets = applyTransactionsToWallets<DashboardWalletRow>(
          baseWallets,
          (balancesTxRes.data ?? []) as TxForBalancesRow[]
        )

        const total = computedWallets.reduce((sum, w) => sum + n(w.balance), 0)
        const spendable = computedWallets
          .filter((w) => w.type !== 'savings' && w.type !== 'credit')
          .reduce((sum, w) => sum + n(w.balance), 0)
        const savings = computedWallets
          .filter((w) => w.type === 'savings')
          .reduce((sum, w) => sum + n(w.balance), 0)

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
        setRecentTransactions((recentTxRes.data ?? []) as TxRecentRow[])
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
