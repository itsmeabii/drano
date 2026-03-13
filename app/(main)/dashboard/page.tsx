import { getUser } from '@/utils/user'
import { getDashboardData } from '@/utils/dashboard'

export default async function DashboardPage() {
  const [user, data] = await Promise.all([
    getUser(),
    getDashboardData(),
  ])

  const displayName = user?.profile?.username ?? 'there'
  return (
    <div className="p-8">

      {/* top bar */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-plum">
            Good morning, <em className="italic text-lilac-600">{displayName}</em> ✦
          </h1>
          <p className="text-lilac-600 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} · you&apos;re doing amazing
          </p>
        </div>
        <button className="bg-plum text-latte text-sm font-bold px-5 py-2.5 rounded-full hover:bg-plum-700 transition-colors">
          + Add Transaction
        </button>
      </div>

      {/* total balance */}
      <div className="bg-plum rounded-[20px] p-6 mb-4 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] rounded-full bg-plum-500 opacity-20 pointer-events-none" />
        <div className="absolute bottom-[-20px] right-[60px] w-[80px] h-[80px] rounded-full bg-lilac opacity-10 pointer-events-none" />
        <p className="text-lilac text-xs mb-1 relative z-10">total balance across all wallets</p>
        <p className="font-display text-4xl font-semibold text-latte relative z-10">
          ₱{data.totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-blush text-xs mt-2 relative z-10">
          {data.wallets.length === 0
            ? '✦ no wallets yet · add one to get started'
            : `✦ ${data.wallets.length} wallet${data.wallets.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* income + expense */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-blush rounded-[18px] p-4">
          <p className="text-lilac text-[11px] mb-1">Income this month</p>
          <p className="font-display text-2xl font-semibold text-plum">
            ₱{data.income.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-income text-[10px] mt-1">
            {data.income === 0 ? 'No income recorded' : 'This month'}
          </p>
        </div>
        <div className="bg-white border border-blush rounded-[18px] p-4">
          <p className="text-lilac text-[11px] mb-1">Expenses this month</p>
          <p className="font-display text-2xl font-semibold text-plum">
            ₱{data.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-expense text-[10px] mt-1">
            {data.expenses === 0 ? 'No expenses recorded' : 'This month'}
          </p>
        </div>
      </div>

      {/* transactions + wallets */}
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 mb-6">

        {/* recent transactions */}
        <div className="bg-white border border-blush rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-sm font-semibold text-plum">Recent Transactions</p>
            <button className="text-xs text-plum font-bold border border-blush rounded-full px-3 py-1 hover:bg-latte transition-colors">
              View All
            </button>
          </div>
          {data.recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-3xl mb-2">💸</p>
              <p className="text-plum text-sm font-semibold">No transactions yet</p>
              <p className="text-lilac text-xs mt-1">Add your first transaction to get started</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-latte last:border-none">
                  <div className="w-8 h-8 rounded-[10px] bg-latte flex items-center justify-center text-sm flex-shrink-0">
                    {tx.type === 'income' ? '💼' : tx.type === 'transfer' ? '🔄' : '💸'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-plum">{tx.note ?? tx.type}</p>
                    <p className="text-[10px] text-lilac">{tx.date}</p>
                  </div>
                  <p className={`text-xs font-semibold font-display ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* wallets */}
        <div className="bg-white border border-blush rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-sm font-semibold text-plum">My Wallets</p>
            <button className="text-xs text-plum font-bold border border-blush rounded-full px-3 py-1 hover:bg-latte transition-colors">
              + Add
            </button>
          </div>
          {data.wallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-3xl mb-2">👛</p>
              <p className="text-plum text-sm font-semibold">No wallets yet</p>
              <p className="text-lilac text-xs mt-1">Add a wallet to start tracking</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {data.wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between py-2 border-b border-latte last:border-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-plum flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-plum">{wallet.name}</p>
                      <p className="text-[10px] text-lilac capitalize">{wallet.type}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold font-display text-plum">
                    ₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
          <p className="font-display text-sm font-semibold text-plum">Savings Goals ✦</p>
          <button className="text-xs text-plum font-bold border border-blush rounded-full px-3 py-1 hover:bg-latte transition-colors">
            + New Goal
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-plum text-sm font-semibold">No savings goals yet</p>
          <p className="text-lilac text-xs mt-1">Set a goal and start manifesting! ✨</p>
        </div>
      </div>

    </div>
  )
}
