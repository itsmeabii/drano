export interface FilterState {
  type: 'all' | 'expense' | 'income' | 'transfer'
  wallet: string
  category: string
}