import { createClient } from '@/lib/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()

  const [wallets, transactions] = await Promise.all([
    supabase.from('wallets').select('*'),
    supabase.from('transactions').select('*').order('date', { ascending: false }).limit(5),
  ])

  const allWallets = wallets.data ?? []

  // total including savings
  const totalBalance = allWallets
    .reduce((sum, w) => sum + parseFloat(String(w.balance ?? 0)), 0)

  // spendable — excludes savings and credit (credit is debt not money)
  const spendableBalance = allWallets
    .filter(w => w.type !== 'savings' && w.type !== 'credit')
    .reduce((sum, w) => sum + parseFloat(String(w.balance ?? 0)), 0)

  // savings total
  const savingsBalance = allWallets
    .filter(w => w.type === 'savings')
    .reduce((sum, w) => sum + parseFloat(String(w.balance ?? 0)), 0)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthlyTransactions = transactions.data?.filter(t => t.date >= startOfMonth) ?? []
  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0)
  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0)

  return {
    totalBalance,
    spendableBalance,
    savingsBalance,
    income,
    expenses,
    recentTransactions: transactions.data ?? [],
    wallets: allWallets,
  }
}