'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface Transaction {
  id: string
  name: string
  wallet_id: string
  to_wallet_id: string | null
  category_id: string | null
  type: 'expense' | 'income' | 'transfer'
  amount: number
  transfer_fee: number
  note: string | null
  date: string
  created_at: string
  wallets: { id: string; name: string; icon: string; color: string } | null
  to_wallet: { id: string; name: string; icon: string; color: string } | null
  categories: { id: string; name: string; icon: string; color: string } | null
}

export interface TransactionForm {
  name: string
  wallet_id: string
  to_wallet_id: string | null
  category_id: string | null
  type: 'expense' | 'income' | 'transfer'
  amount: number
  transfer_fee: number
  note: string
  date: string
}

const TRANSACTION_QUERY = `
  *,
  wallets!transactions_wallet_id_fkey(id, name, icon, color),
  to_wallet:wallets!transactions_to_wallet_id_fkey(id, name, icon, color),
  categories(id, name, icon, color)
`

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const normalizeTransactions = (data: Transaction[]) =>
    data.map((tx) => ({
      ...tx,
      amount: parseFloat(String(tx.amount)),
      transfer_fee: parseFloat(String(tx.transfer_fee ?? 0)),
    }))

  // ── Fetch transactions safely in effect ──
  useEffect(() => {
    let cancelled = false

    const loadTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(TRANSACTION_QUERY)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (!cancelled && data) {
        setTransactions(normalizeTransactions(data))
      }

      if (error) {
        console.error('fetchTransactions error:', error)
        if (!cancelled) setError(error.message)
      }
    }

    loadTransactions()

    return () => {
      cancelled = true
    }
  }, [])

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(TRANSACTION_QUERY)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) setTransactions(normalizeTransactions(data))
    if (error) setError(error.message)
  }

  // ── Add a transaction ──
  const addTransaction = async (form: TransactionForm) => {
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { data: newTx, error: txError } = await supabase
        .from('transactions')
        .insert({ ...form, user_id: user.id })
        .select(TRANSACTION_QUERY)
        .single()

      if (txError) throw txError

      if (newTx) {
        setTransactions((prev) => [normalizeTransactions([newTx])[0], ...prev])
      }

      router.refresh()
      setLoading(false)
      return true
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
      setLoading(false)
      return false
    }
  }

  const deleteTransaction = async (id: string) => {
    setLoading(true)
    setError('')

    try {
      await supabase.from('transactions').delete().eq('id', id)

      setTransactions((prev) => prev.filter((tx) => tx.id !== id))
      router.refresh()
      setLoading(false)
      return true
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
      setLoading(false)
      return false
    }
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
  }
}
