import { DashboardWalletRow } from './dashboard'

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

export type NormalizedWallet = Omit<
  DashboardWalletRow,
  'balance' | 'credit_limit' | 'credit_used' | 'interest_rate'
> & {
  balance: number
  credit_limit: number
  credit_used: number
  interest_rate: number
}
