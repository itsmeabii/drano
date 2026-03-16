import { getUser } from '@/utils/user'
import { getDashboardData } from '@/utils/dashboard'
import { formatCurrency, formatDate } from '@/utils/formatters'
import AddTransactionButton from '@/components/AddTransactionButton'
import AddWalletButton from '@/components/AddWalletButton'
import AddGoalButton from '@/components/AddGoalButton'
import BalanceCard from '@/components/BalanceCard'
import Link from 'next/link'

export default async function DashboardPage() {
  const [user, data] = await Promise.all([
    getUser(),
    getDashboardData(),
  ])

  const displayName = user?.profile?.first_name ?? user?.profile?.username ?? 'there'

  return (
    <div className="p-4 md:p-8">

      {/* top bar */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-plum">
            Good morning, <em className="italic text-lilac">{displayName}</em> ✦
          </h1>
          <p className="text-lilac text-base mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} · you&apos;re doing amazing
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

      {/* income + expense */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-blush rounded-[18px] p-5">
          <p className="text-lilac text-sm mb-1">Income this month</p>
          <p className="font-display text-3xl font-semibold text-plum">
            {formatCurrency(data.income)}
          </p>
          <p className="text-income text-sm mt-1">
            {data.income === 0 ? 'No income recorded' : 'This month'}
          </p>
        </div>
        <div className="bg-white border border-blush rounded-[18px] p-5">
          <p className="text-lilac text-sm mb-1">Expenses this month</p>
          <p className="font-display text-3xl font-semibold text-plum">
            {formatCurrency(data.expenses)}
          </p>
          <p className="text-expense text-sm mt-1">
            {data.expenses === 0 ? 'No expenses recorded' : 'This month'}
          </p>
        </div>
      </div>

      {/* transactions + wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-6">

        {/* recent transactions */}
        <div className="bg-white border border-blush rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg font-semibold text-plum">Recent Transactions</p>
            <Link
              href="/transactions"
              className="text-sm text-plum font-bold border border-blush rounded-full px-3 py-1.5 hover:bg-latte transition-colors"
            >
              View All
            </Link>
          </div>

          {data.recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-4xl mb-3">💸</p>
              <p className="text-plum text-base font-semibold">No transactions yet</p>
              <p className="text-lilac text-sm mt-1">Add your first transaction to get started</p>
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto flex flex-col gap-1 pr-2">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-latte last:border-none">
                  <div className="w-10 h-10 rounded-[10px] bg-latte flex items-center justify-center text-lg flex-shrink-0">
                    {tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '🔄' : '💸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-plum truncate">
                      {tx.name || tx.note || tx.type}
                    </p>
                    <p className="text-xs text-lilac">{formatDate(tx.date)}</p>
                  </div>
                  <p className={`text-sm font-semibold font-display flex-shrink-0 ${
                    tx.type === 'income'
                      ? 'text-income'
                      : tx.type === 'transfer'
                        ? 'text-lilac'
                        : 'text-expense'
                  }`}>
                    {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-'}{formatCurrency(parseFloat(String(tx.amount)))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* wallets */}
        <div className="bg-white border border-blush rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg font-semibold text-plum">My Wallets</p>
            <AddWalletButton />
          </div>

          {data.wallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-4xl mb-3">👛</p>
              <p className="text-plum text-base font-semibold">No wallets yet</p>
              <p className="text-lilac text-sm mt-1">Add a wallet to start tracking</p>
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto flex flex-col gap-1 pr-2">
              {data.wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between py-3 border-b border-latte last:border-none">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: wallet.color ?? '#674188' }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-plum">{wallet.name}</p>
                      <p className="text-xs text-lilac capitalize">{wallet.type}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold font-display ${
                    wallet.type === 'credit' ? 'text-expense' : 'text-plum'
                  }`}>
                    {formatCurrency(parseFloat(String(wallet.balance)))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* savings goals */}
      <div className="bg-white border border-blush rounded-[18px] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-lg font-semibold text-plum">Savings Goals ✦</p>
          <AddGoalButton />
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-plum text-base font-semibold">No savings goals yet</p>
          <p className="text-lilac text-sm mt-1">Set a goal and start manifesting! ✨</p>
        </div>
      </div>

    </div>
  )
}