import { createClient } from '@/lib/supabase/server'

export async function getWallets() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return []
  return data
}

export async function getWalletsTotalBalance() {
  const wallets = await getWallets()
  return wallets.reduce((sum, w) => sum + (w.balance ?? 0), 0)
}