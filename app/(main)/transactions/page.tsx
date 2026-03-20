'use client'

import { useState, useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { DateRangeState } from '@/types/date'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { TYPE_OPTIONS } from '@/constants/FilterOptions'
import Dropdown from '@/components/Dropdown'
import DateRangePicker from '@/components/DateRangePicker'
import ConfirmModal from '@/components/ConfirmModal'
import AddTransactionModal from '@/components/AddTransactionModal'
import { FilterState } from '@/types/filter'
import { Skeleton } from '@/components/Skeleton'

export default function TransactionsPage() {
  const { transactions, deleteTransaction, fetchTransactions, loading } = useTransactions()
  const { wallets } = useWallets()
  const { categories } = useCategories()

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
    return transactions.filter((tx) => {
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
    filtered.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = []
      groups[tx.date].push(tx)
    })
    return groups
  }, [filtered])

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="p-4 md:p-8">
      {/* header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-plum text-3xl font-semibold">Transactions ✦</h1>
          <p className="text-lilac mt-1 text-base">Track every peso in and out</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-plum text-latte hover:bg-plum-700 rounded-full px-5 py-2.5 text-sm font-bold transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      {/* summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-plum relative overflow-hidden rounded-[18px] p-5">
          <div className="bg-plum-500 pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full opacity-20" />
          <p className="text-lilac relative z-10 mb-1 text-sm">Net Balance</p>
          <p className="font-display text-latte relative z-10 text-2xl font-semibold">
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
        <div className="border-blush rounded-[18px] border bg-white p-5">
          <p className="text-lilac mb-1 text-sm">Total Income</p>
          <p className="font-display text-income text-2xl font-semibold">
            +{formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="border-blush rounded-[18px] border bg-white p-5">
          <p className="text-lilac mb-1 text-sm">Total Expenses</p>
          <p className="font-display text-expense text-2xl font-semibold">
            -{formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      {/* filters + date range */}
      <div className="border-blush mb-6 rounded-[18px] border bg-white p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-35">
            <Dropdown
              label="Type"
              value={filters.type}
              onChange={(v) => setFilters({ ...filters, type: v as FilterState['type'] })}
              options={[{ value: 'all', label: 'All Types' }, ...TYPE_OPTIONS]}
            />
          </div>

          <div className="w-45">
            <Dropdown
              label="Wallet"
              value={filters.wallet}
              onChange={(v) => setFilters({ ...filters, wallet: v })}
              options={[
                { value: 'all', label: 'All Wallets' },
                ...wallets.map((w) => ({ value: w.id, label: `${w.name}` })),
              ]}
            />
          </div>

          <div className="w-45">
            <Dropdown
              label="Category"
              value={filters.category}
              onChange={(v) => setFilters({ ...filters, category: v })}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.id, label: `${c.name}` })),
              ]}
            />
          </div>

          <div className="min-w-65 flex-1">
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
      {(() => {
        if (loading) {
          return (
            <div className="border-blush overflow-hidden rounded-[18px] border bg-white">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 ${i !== 4 ? 'border-latte border-b' : ''}`}
                >
                  <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )
        }

        if (filtered.length === 0) {
          return (
            <div className="border-blush flex flex-col items-center justify-center rounded-[18px] border bg-white py-16 text-center">
              <p className="mb-3 text-4xl">💸</p>
              <p className="text-plum text-base font-semibold">No transactions found</p>
              <p className="text-lilac mt-1 text-sm">
                Try adjusting your filters or add a new transaction
              </p>
            </div>
          )
        }

        return (
          <div className="flex flex-col gap-4">
            {Object.entries(grouped).map(([date, txs]) => (
              <div key={date}>
                {/* date header */}
                <div className="mb-3 flex items-center gap-3">
                  <p className="font-display text-plum text-base font-semibold">
                    {formatDate(date)}
                  </p>
                  <div className="bg-blush h-px flex-1" />
                  <p className="text-lilac text-sm">
                    {txs.length} transaction{txs.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* transactions */}
                <div className="border-blush overflow-hidden rounded-[18px] border bg-white">
                  {txs.map((tx, i) => (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-4 p-4 ${i !== txs.length - 1 ? 'border-latte border-b' : ''}`}
                    >
                      {/* icon */}
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                        style={{ background: `${tx.wallets?.color ?? '#674188'}22` }}
                      >
                        {tx.categories?.icon ??
                          (tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '🔄' : '💸')}
                      </div>

                      {/* details */}
                      <div className="min-w-0 flex-1">
                        <p className="text-plum truncate text-sm font-semibold">
                          {tx.name || tx.categories?.name || tx.type}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          {tx.categories && (
                            <span className="text-lilac text-xs">{tx.categories.name}</span>
                          )}
                          {tx.categories && tx.wallets && (
                            <span className="text-blush text-xs">·</span>
                          )}
                          {tx.wallets && (
                            <span className="text-lilac text-xs">
                              {tx.wallets.icon} {tx.wallets.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* amount */}
                      <div className="shrink-0 text-right">
                        <p
                          className={`font-display text-base font-semibold ${
                            tx.type === 'income'
                              ? 'text-income'
                              : tx.type === 'transfer'
                                ? 'text-lilac'
                                : 'text-expense'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-'}
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-lilac text-xs capitalize">{tx.type}</p>
                      </div>

                      {/* delete */}
                      <button
                        onClick={() => setConfirmDelete(tx.id)}
                        className="text-blush hover:text-expense shrink-0 text-sm transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })()}

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
        <AddTransactionModal onClose={() => setShowModal(false)} onSuccess={fetchTransactions} />
      )}
    </div>
  )
}
