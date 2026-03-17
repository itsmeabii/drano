'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { applyTransactionsToWallets } from '@/utils/walletMath'

export interface Wallet {
  id: string
  name: string
  type: string
  balance: number
  credit_limit: number
  credit_used: number
  interest_rate: number
  icon: string
  color: string
  opening_balance?: number
  ledger_balance?: number
}

export interface WalletForm {
  name: string
  type: 'cash' | 'debit' | 'credit' | 'savings'
  balance: number
  credit_limit: number
  credit_used: number
  interest_rate: number
  icon: string
  color: string
}

const normalizeWallets = (data: Wallet[]): Wallet[] =>
  data.map((w) => ({
    ...w,
    balance: parseFloat(String(w.balance ?? 0)),
    credit_limit: parseFloat(String(w.credit_limit ?? 0)),
    credit_used: parseFloat(String(w.credit_used ?? 0)),
    interest_rate: parseFloat(String(w.interest_rate ?? 0)),
  }))

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  type WalletTxRow = {
    type: 'expense' | 'income' | 'transfer'
    wallet_id: string
    to_wallet_id: string | null
    amount: number
    transfer_fee: number | null
    date: string
  }

  const fetchWalletsWithComputedBalances = useCallback(async () => {
    const [{ data: walletsData, error: walletsError }, { data: txData, error: txError }] =
      await Promise.all([
        supabase.from('wallets').select('*').order('created_at', { ascending: true }),
        supabase
          .from('transactions')
          .select('type, wallet_id, to_wallet_id, amount, transfer_fee, date')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
      ])

    if (walletsError) throw walletsError
    if (txError) throw txError

    const normalizedWallets = walletsData ? normalizeWallets(walletsData as Wallet[]) : []
    const computed = applyTransactionsToWallets<Wallet>(
      normalizedWallets,
      (txData ?? []) as WalletTxRow[]
    )

    setWallets(computed)
  }, [supabase])

  const fetchWallets = async () => {
    try {
      await fetchWalletsWithComputedBalances()
    } catch (e: unknown) {
      console.error('fetchWallets error:', e)
      if (e instanceof Error) setError(e.message)
      else setError('Something went wrong')
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        await fetchWalletsWithComputedBalances()
      } catch (e: unknown) {
        console.error('fetchWallets error:', e)
        if (e instanceof Error) setError(e.message)
        else setError('Something went wrong')
      }
    }
    load()
  }, [fetchWalletsWithComputedBalances])

  const addWallet = async (form: WalletForm) => {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('wallets').insert({
      ...form,
      user_id: user.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    await fetchWallets()
    router.refresh()
    setLoading(false)
    return true
  }

  const updateWallet = async (id: string, form: Partial<WalletForm>) => {
    setLoading(true)
    setError('')

    const { error } = await supabase.from('wallets').update(form).eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    await fetchWallets()
    router.refresh()
    setLoading(false)
    return true
  }

  const deleteWallet = async (id: string) => {
    setLoading(true)
    setError('')

    const { error } = await supabase.from('wallets').delete().eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    await fetchWallets()
    router.refresh()
    setLoading(false)
    return true
  }

  return {
    wallets,
    loading,
    error,
    fetchWallets,
    addWallet,
    updateWallet,
    deleteWallet,
  }
}
