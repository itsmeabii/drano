'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { applyTransactionsToWallets } from '@/utils/walletMath'
import { Wallet, WalletForm } from '@/types/wallet'

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // ── Helper: normalize wallets so all numbers are numbers ──
  const normalizeWallets = (data: Wallet[]): Wallet[] =>
    data.map((w) => ({
      ...w,
      balance: Number(w.balance ?? 0),
      credit_limit: Number(w.credit_limit ?? 0),
      credit_used: Number(w.credit_used ?? 0),
      interest_rate: Number(w.interest_rate ?? 0),
    }))

  // ── Helper: normalize transactions ──
  type WalletTxRow = {
    type: 'expense' | 'income' | 'transfer'
    wallet_id: string
    to_wallet_id: string | null
    amount: number
    transfer_fee: number | null
    date: string
  }

  const normalizeTransactions = (txs: WalletTxRow[]): WalletTxRow[] =>
    txs.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      transfer_fee: Number(tx.transfer_fee ?? 0),
    }))

  // ── Fetch wallets with computed balances ──
  const fetchWalletsWithComputedBalances = useCallback(async () => {
    const [{ data: walletsData, error: walletsError }, { data: txData, error: txError }] =
      await Promise.all([
        supabase.from('wallets').select('*').order('created_at', { ascending: true }),
        supabase
          .from('transactions')
          .select('type, wallet_id, to_wallet_id, amount, transfer_fee, date')
          .eq('status', 'success') // only successful transactions
          .order('date', { ascending: true }),
      ])

    if (walletsError) throw walletsError
    if (txError) throw txError

    const normalizedWalletsData = normalizeWallets(walletsData ?? [])
    const normalizedTxData = normalizeTransactions((txData ?? []) as WalletTxRow[])

    const computed = applyTransactionsToWallets<Wallet>(normalizedWalletsData, normalizedTxData)

    setWallets(computed)
  }, [supabase])

  const fetchWallets = async () => {
    setLoading(true)
    setError('')
    try {
      await fetchWalletsWithComputedBalances()
    } catch (e: unknown) {
      const msg =
        e &&
        typeof e === 'object' &&
        'message' in e &&
        typeof (e as { message: unknown }).message === 'string'
          ? (e as { message: string }).message
          : 'Something went wrong'
      console.error('fetchWallets error:', msg, e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallets()
  }, [fetchWalletsWithComputedBalances])

  const addWallet = async (form: WalletForm) => {
    setLoading(true)
    setError('')
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not logged in')

      const { error } = await supabase.from('wallets').insert({ ...form, user_id: user.id })
      if (error) throw error

      await fetchWallets()
      router.refresh()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateWallet = async (id: string, form: Partial<WalletForm>) => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.from('wallets').update(form).eq('id', id)
      if (error) throw error

      await fetchWallets()
      router.refresh()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteWallet = async (id: string) => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.from('wallets').delete().eq('id', id)
      if (error) throw error

      await fetchWallets()
      router.refresh()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { wallets, loading, error, fetchWallets, addWallet, updateWallet, deleteWallet }
}
