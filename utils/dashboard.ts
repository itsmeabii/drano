import { createClient } from '@/lib/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()

  const [wallets, transactions] = await Promise.all([
    supabase.from('wallets').select('*'),
    supabase.from('transactions').select('*').order('date', { ascending: false }).limit(5),
  ])

  const totalBalance = wallets.data?.reduce((sum, w) => sum + w.balance, 0) ?? 0

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const monthlyTransactions = transactions.data?.filter(t => t.date >= startOfMonth) ?? []
  const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return {
    totalBalance,
    income,
    expenses,
    recentTransactions: transactions.data ?? [],
    wallets: wallets.data ?? [],
  }
}