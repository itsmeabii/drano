'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Transaction {
  id: string
  name: string
  wallet_id: string
  to_wallet_id: string | null
  category_id: string | null
  type: 'expense' | 'income' | 'transfer'
  amount: number
  transfer_fee: string | number | null
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
  const router = useRouter()
  const supabase = createClient()

  const normalizeTransactions = (data: Transaction[]): Transaction[] =>
    data.map(tx => ({
      ...tx,
      amount: parseFloat(String(tx.amount)),
      transfer_fee: parseFloat(String(tx.transfer_fee ?? 0)),
  }))

const fetchTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select(TRANSACTION_QUERY)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchTransactions error:', error)
    return
  }

  if (data) setTransactions(normalizeTransactions(data))
}

useEffect(() => {
  const load = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(TRANSACTION_QUERY)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('load error:', error)
      return
    }

    if (data) setTransactions(normalizeTransactions(data))
  }
  load()
}, [])

  const addTransaction = async (form: TransactionForm) => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: newTx, error: txError } = await supabase
      .from('transactions')
      .insert({ ...form, user_id: user.id })
      .select(TRANSACTION_QUERY)
      .single()

    if (txError) {
      setError(txError.message)
      setLoading(false)
      return false
    }

    // optimistic update — add to local state immediately
    if (newTx) {
      setTransactions(prev => [newTx, ...prev].sort((a, b) =>
        b.date.localeCompare(a.date)
      ))
    }

    // update wallet balances
    if (form.type === 'expense') {
      const { data: wallet } = await supabase
      .from('wallets').select('balance, type, credit_used').eq('id', form.wallet_id).single()

      if (wallet) {
        if (wallet.type === 'credit') {
          // increase credit used
          await supabase.from('wallets')
            .update({ credit_used: parseFloat(String(wallet.credit_used)) + form.amount })
            .eq('id', form.wallet_id)
        } else {
          // normal deduction
          await supabase.from('wallets')
            .update({ balance: parseFloat(String(wallet.balance)) - form.amount })
            .eq('id', form.wallet_id)
        }
      }
    } else if (form.type === 'income') {
        const { data: wallet } = await supabase
        .from('wallets').select('balance, type, credit_used').eq('id', form.wallet_id).single()

        if (wallet) {
          if (wallet.type === 'credit') {
            // decrease credit used — paying off the bill
            await supabase.from('wallets')
              .update({ credit_used: Math.max(0, parseFloat(String(wallet.credit_used)) - form.amount) })
              .eq('id', form.wallet_id)
          } else {
            // normal addition
            await supabase.from('wallets')
              .update({ balance: parseFloat(String(wallet.balance)) + form.amount })
              .eq('id', form.wallet_id)
          }
        }
      } else if (form.type === 'transfer' && form.to_wallet_id) {
        // 1. deduct from source wallet
        const { data: fromWallet } = await supabase
          .from('wallets').select('balance').eq('id', form.wallet_id).single()
        if (fromWallet) {
          await supabase.from('wallets')
            .update({ balance: parseFloat(String(fromWallet.balance)) - form.amount })
            .eq('id', form.wallet_id)
        }

        // 2. add to destination wallet
        const { data: toWallet } = await supabase
          .from('wallets').select('balance').eq('id', form.to_wallet_id).single()
        if (toWallet) {
          await supabase.from('wallets')
            .update({ balance: parseFloat(String(toWallet.balance)) + form.amount })
            .eq('id', form.to_wallet_id)
        }

        // 3. record fee as a separate expense transaction if provided
        if (form.transfer_fee > 0) {
          const { data: feeCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('name', 'Transfer Fee')
            .single()

          // deduct fee from destination wallet
          if (toWallet && feeCategory) {
            await supabase.from('wallets')
              .update({ balance: parseFloat(String(toWallet.balance)) + form.amount - form.transfer_fee })
              .eq('id', form.to_wallet_id)

            await supabase.from('transactions').insert({
              user_id: user.id,
              name: 'Transfer Fee',
              wallet_id: form.to_wallet_id,
              category_id: feeCategory.id,
              type: 'expense',
              amount: form.transfer_fee,
              note: form.note ? `Transfer fee — ${form.note}` : 'Transfer fee',
              date: form.date,
            })
          }
        }
      }

    router.refresh()
    setLoading(false)
    return true
  }

  const deleteTransaction = async (id: string) => {
    setLoading(true)
    setError('')

    setTransactions(prev => prev.filter(tx => tx.id !== id))

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      // revert on error
      await fetchTransactions()
      setLoading(false)
      return false
    }

    router.refresh()
    setLoading(false)
    return true
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