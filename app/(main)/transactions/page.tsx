'use client'

import { useState, useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { DateRangeState } from '@/types/date'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { WALLET_TYPE_OPTIONS } from '@/constants/FilterOptions'
import Dropdown from '@/components/Dropdown'
import DateRangePicker from '@/components/DateRangePicker'
import ConfirmModal from '@/components/ConfirmModal'
import AddTransactionModal from '@/components/AddTransactionModal'
import { FilterState } from '@/types/filter'

export default function TransactionsPage() {
  const { transactions, deleteTransaction, fetchTransactions } = useTransactions()
  const { wallets } = useWallets()
  const categories = useCategories()

  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    wallet: 'all',
    category: 'all',
  })
  const [dateRange, setDateRange] = useState<DateRangeState>({
    from: '',
    to: '',
  })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filters.type !== 'all' && tx.type !== filters.type) return false
      if (filters.wallet !== 'all' && tx.wallet_id !== filters.wallet) return false
      if (filters.category !== 'all' && tx.category_id !== filters.category) return false
      if (dateRange.from && tx.date < dateRange.from) return false
      if (dateRange.to && tx.date > dateRange.to) return false
      return true
    })
  }, [transactions, filters, dateRange])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {}
    filtered.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = []
      groups[tx.date].push(tx)
    })
    return groups
  }, [filtered])

  const totalIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const totalExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="p-4 md:p-8">

      {/* header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-plum">Transactions ✦</h1>
          <p className="text-lilac text-base mt-1">Track every peso in and out</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-plum text-latte text-sm font-bold px-5 py-2.5 rounded-full hover:bg-plum-700 transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-plum rounded-[18px] p-5 relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-[80px] h-[80px] rounded-full bg-plum-500 opacity-20 pointer-events-none" />
          <p className="text-lilac text-sm mb-1 relative z-10">Net Balance</p>
          <p className="font-display text-2xl font-semibold text-latte relative z-10">
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
        <div className="bg-white border border-blush rounded-[18px] p-5">
          <p className="text-lilac text-sm mb-1">Total Income</p>
          <p className="font-display text-2xl font-semibold text-income">
            +{formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-white border border-blush rounded-[18px] p-5">
          <p className="text-lilac text-sm mb-1">Total Expenses</p>
          <p className="font-display text-2xl font-semibold text-expense">
            -{formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      {/* filters + date range */}
    <div className="bg-white border border-blush rounded-[18px] p-5 mb-6">
    <div className="flex flex-wrap gap-4 items-end">

        <div className="w-[140px]">
        <Dropdown
            label="Type"
            value={filters.type}
            onChange={(v) => setFilters({ ...filters, type: v as FilterState['type'] })}
            options={[{ value: 'all', label: 'All Types' }, 
                ...WALLET_TYPE_OPTIONS]}
        />
        </div>

        <div className="w-[180px]">
        <Dropdown
            label="Wallet"
            value={filters.wallet}
            onChange={(v) => setFilters({ ...filters, wallet: v })}
            options={[
            { value: 'all', label: 'All Wallets' },
            ...wallets.map(w => ({ value: w.id, label: `${w.name}` })),
            ]}
        />
        </div>

        <div className="w-[180px]">
        <Dropdown
            label="Category"
            value={filters.category}
            onChange={(v) => setFilters({ ...filters, category: v })}
            options={[
            { value: 'all', label: 'All Categories' },
            ...categories.map(c => ({ value: c.id, label: `${c.name}` })),
            ]}
        />
        </div>

        <div className="flex-1 min-w-[260px]">
        <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onFromChange={(v) => setDateRange({ ...dateRange, from: v })}
            onToChange={(v) => setDateRange({ ...dateRange, to: v })}
        />
        </div>

    </div>
    </div>

      {/* transactions list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-blush rounded-[18px]">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-plum text-base font-semibold">No transactions found</p>
          <p className="text-lilac text-sm mt-1">Try adjusting your filters or add a new transaction</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>

              {/* date header */}
              <div className="flex items-center gap-3 mb-3">
                <p className="font-display text-base font-semibold text-plum">
                  {formatDate(date)}
                </p>
                <div className="flex-1 h-px bg-blush" />
                <p className="text-sm text-lilac">
                  {txs.length} transaction{txs.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* transactions */}
              <div className="bg-white border border-blush rounded-[18px] overflow-hidden">
                {txs.map((tx, i) => (
                  <div
                    key={tx.id}
                    className={`flex items-center gap-4 p-4 ${i !== txs.length - 1 ? 'border-b border-latte' : ''}`}
                  >
                    {/* icon */}
                    <div
                      className="w-11 h-11 rounded-[12px] flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${tx.wallets?.color ?? '#674188'}22` }}
                    >
                      {tx.categories?.icon ?? (tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '🔄' : '💸')}
                    </div>

                    {/* details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-plum truncate">
                        {tx.name || tx.categories?.name || tx.type}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {tx.categories && (
                          <span className="text-xs text-lilac">{tx.categories.name}</span>
                        )}
                        {tx.categories && tx.wallets && (
                          <span className="text-xs text-blush">·</span>
                        )}
                        {tx.wallets && (
                          <span className="text-xs text-lilac">
                            {tx.wallets.icon} {tx.wallets.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-display text-base font-semibold ${
                        tx.type === 'income'
                          ? 'text-income'
                          : tx.type === 'transfer'
                            ? 'text-lilac'
                            : 'text-expense'
                      }`}>
                        {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-lilac capitalize">{tx.type}</p>
                    </div>

                    {/* delete */}
                    <button
                      onClick={() => setConfirmDelete(tx.id)}
                      className="text-blush hover:text-expense text-sm transition-colors flex-shrink-0"
                    >
                      ✕
                    </button>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This cannot be undone."
          confirmLabel="Delete Transaction"
          onConfirm={() => {
            deleteTransaction(confirmDelete)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showModal && (
        <AddTransactionModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchTransactions}
        />
        )}

    </div>
  )
}