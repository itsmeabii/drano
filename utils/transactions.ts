import { createClient } from '@/lib/supabase/server'

export async function getTransactions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select(
      `
      *,
      wallets(id, name, icon, color),
      categories(id, name, icon, color)
    `
    )
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
