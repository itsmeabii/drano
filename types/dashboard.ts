import { WalletMathWallet } from '@/utils/walletMath'

export type ProfileRow = {
  first_name: string | null
  username: string | null
}

export type DashboardWalletRow = WalletMathWallet & {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

export type RawTxRow = {
  type: 'expense' | 'income' | 'transfer'
  wallet_id: string
  to_wallet_id?: string | null
  amount: number | string | null
  transfer_fee?: number | string | null
  date: string
}

export type RawWalletRow = {
  id: string
  name: string
  type: string
  balance: number | string | null
  credit_limit?: number | string | null
  credit_used?: number | string | null
  interest_rate?: number | string | null
  icon?: string | null
  color?: string | null
}

export type TxRecentRow = {
  id: string
  name: string
  note: string | null
  type: 'expense' | 'income' | 'transfer'
  amount: number
  date: string
}

export type TxForBalancesRow = {
  type: 'expense' | 'income' | 'transfer'
  wallet_id: string
  to_wallet_id: string | null
  amount: number
  transfer_fee: number
  date: string
}
