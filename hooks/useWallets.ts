'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  data.map(w => ({
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
  const supabase = createClient()

  const fetchWallets = async () => {
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setWallets(normalizeWallets(data))
  }

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: true })
      if (data) setWallets(normalizeWallets(data))
    }
    load()
  }, [])

  const addWallet = async (form: WalletForm) => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
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

    const { error } = await supabase
      .from('wallets')
      .update(form)
      .eq('id', id)

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

    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id)

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