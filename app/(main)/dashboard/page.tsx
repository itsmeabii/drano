'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { formatCurrency, formatDate } from '@/utils/formatters'
import AddTransactionButton from '@/components/AddTransactionButton'
import AddWalletButton from '@/components/AddWalletButton'
import AddGoalButton from '@/components/AddGoalButton'
import BalanceCard from '@/components/BalanceCard'
import { Skeleton } from '@/components/Skeleton'
import Link from 'next/link'

export default function DashboardPage() {
  const data = useDashboard()

  return (
    <div className="p-4 md:p-8">
      {/* top bar */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-plum text-3xl font-semibold">
            Good morning, <em className="text-lilac italic">{data.displayName}</em> ✦
          </h1>
          <p className="text-lilac mt-1 text-base">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · you&apos;re doing amazing
          </p>
        </div>
        <AddTransactionButton />
      </div>

      {/* balance card */}
      <BalanceCard
        totalBalance={data.totalBalance}
        spendableBalance={data.spendableBalance}
        savingsBalance={data.savingsBalance}
        walletCount={data.wallets.length}
      />

      {data.error && (
        <div className="border-blush text-expense mb-6 rounded-xl border bg-[#fdf0f5] px-4 py-3 text-sm">
          {data.error}
        </div>
      )}

      {/* income + expense */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="border-blush rounded-[18px] border bg-white p-5">
          <p className="text-lilac mb-1 text-sm">Income this month</p>
          {data.loading ? (
            <Skeleton className="mt-1 h-9 w-40 rounded-full" />
          ) : (
            <p className="font-display text-plum text-3xl font-semibold">
              {formatCurrency(data.income)}
            </p>
          )}
          <p className="text-income mt-1 text-sm">
            {data.income === 0 ? 'No income recorded' : 'This month'}
          </p>
        </div>
        <div className="border-blush rounded-[18px] border bg-white p-5">
          <p className="text-lilac mb-1 text-sm">Expenses this month</p>
          {data.loading ? (
            <Skeleton className="mt-1 h-9 w-40 rounded-full" />
          ) : (
            <p className="font-display text-plum text-3xl font-semibold">
              {formatCurrency(data.expenses)}
            </p>
          )}
          <p className="text-expense mt-1 text-sm">
            {data.expenses === 0 ? 'No expenses recorded' : 'This month'}
          </p>
        </div>
      </div>

      {/* transactions + wallets */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* recent transactions */}
        <div className="border-blush rounded-[18px] border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-plum text-lg font-semibold">Recent Transactions</p>
            <Link
              href="/transactions"
              className="text-plum border-blush hover:bg-latte rounded-full border px-3 py-1.5 text-sm font-bold transition-colors"
            >
              View All
            </Link>
          </div>

          {data.loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-[10px]" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3.5 w-32 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : data.recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-3 text-4xl">💸</p>
              <p className="text-plum text-base font-semibold">No transactions yet</p>
              <p className="text-lilac mt-1 text-sm">Add your first transaction to get started</p>
            </div>
          ) : (
            <div className="flex max-h-80 flex-col gap-1 overflow-y-auto pr-2">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border-latte flex items-center gap-3 border-b py-2.5 last:border-none"
                >
                  <div className="bg-latte flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-lg">
                    {tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '🔄' : '💸'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-plum truncate text-sm font-semibold">
                      {tx.name || tx.note || tx.type}
                    </p>
                    <p className="text-lilac text-xs">{formatDate(tx.date)}</p>
                  </div>
                  <p
                    className={`font-display shrink-0 text-sm font-semibold ${
                      tx.type === 'income'
                        ? 'text-income'
                        : tx.type === 'transfer'
                          ? 'text-lilac'
                          : 'text-expense'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-'}
                    {formatCurrency(parseFloat(String(tx.amount)))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* wallets */}
        <div className="border-blush rounded-[18px] border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-plum text-lg font-semibold">My Wallets</p>
            <AddWalletButton />
          </div>

          {data.loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-24 rounded-full" />
                      <Skeleton className="h-3 w-14 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-3.5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : data.wallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-3 text-4xl">👛</p>
              <p className="text-plum text-base font-semibold">No wallets yet</p>
              <p className="text-lilac mt-1 text-sm">Add a wallet to start tracking</p>
            </div>
          ) : (
            <div className="flex max-h-80 flex-col gap-1 overflow-y-auto pr-2">
              {data.wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="border-latte flex items-center justify-between border-b py-3 last:border-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: wallet.color ?? '#674188' }}
                    />
                    <div>
                      <p className="text-plum text-sm font-semibold">{wallet.name}</p>
                      <p className="text-lilac text-xs capitalize">{wallet.type}</p>
                    </div>
                  </div>
                  <p
                    className={`font-display text-sm font-semibold ${
                      wallet.type === 'credit' ? 'text-expense' : 'text-plum'
                    }`}
                  >
                    {formatCurrency(parseFloat(String(wallet.balance)))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* savings goals */}
      <div className="border-blush rounded-[18px] border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-plum text-lg font-semibold">Savings Goals ✦</p>
          <AddGoalButton />
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="mb-3 text-4xl">⭐</p>
          <p className="text-plum text-base font-semibold">No savings goals yet</p>
          <p className="text-lilac mt-1 text-sm">Set a goal and start manifesting! ✨</p>
        </div>
      </div>
    </div>
  )
}
