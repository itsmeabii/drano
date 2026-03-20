'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useMemo, useState } from 'react'
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
  wallets?: { id: string; name: string; icon: string; color: string } | null
  to_wallet?: { id: string; name: string; icon: string; color: string } | null
  categories?: { id: string; name: string; icon: string; color: string } | null
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
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const normalizeTransactions = (data: Transaction[]) =>
    data.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      transfer_fee: Number(tx.transfer_fee ?? 0),
    }))

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(TRANSACTION_QUERY)
        .eq('status', 'success')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (data) setTransactions(normalizeTransactions(data))
      if (error) setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

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
        .insert({ ...form, user_id: user.id, status: 'success' })
        .select('*')
        .single()

      if (txError) throw txError
      if (newTx) setTransactions((prev) => [normalizeTransactions([newTx])[0], ...prev])

      router.refresh()
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    setLoading(true)
    setError('')
    try {
      await supabase.from('transactions').delete().eq('id', id)
      setTransactions((prev) => prev.filter((tx) => tx.id !== id))
      router.refresh()
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateTransaction = async (id: string, form: TransactionForm) => {
    setLoading(true)
    setError('')
    try {
      const { data: updatedTx, error: txError } = await supabase
        .from('transactions')
        .update({ ...form })
        .eq('id', id)
        .select(TRANSACTION_QUERY)
        .single()

      if (txError) throw txError

      if (updatedTx) {
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === id ? normalizeTransactions([updatedTx])[0] : tx))
        )
      }

      router.refresh()
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  }
}
