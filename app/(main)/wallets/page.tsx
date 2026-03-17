'use client'

import { useState } from 'react'
import { useWallets } from '@/hooks/useWallets'
import WalletCard from '@/components/WalletCard'
import AddWalletModal from '@/components/AddWalletModal'
import { formatCurrency } from '@/utils/formatters'

export default function WalletsPage() {
  const [showModal, setShowModal] = useState(false)
  const { wallets, fetchWallets, loading } = useWallets()

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance ?? 0), 0)
  const totalCreditUsed = wallets
    .filter((w) => w.type === 'credit')
    .reduce((sum, w) => sum + (w.credit_used ?? 0), 0)

  // ← remove the local fetchWallets that throws an error!

  return (
    <div className="p-4 md:p-8">
      {/* header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-plum text-2xl font-semibold">My Wallets ✦</h1>
          <p className="text-lilac mt-1 text-sm">Manage your cash, debit and credit accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-plum text-latte hover:bg-plum-700 rounded-full px-5 py-2.5 text-sm font-bold transition-colors"
        >
          + Add Wallet
        </button>
      </div>

      {/* total balance card */}
      <div className="bg-plum relative mb-6 overflow-hidden rounded-[20px] p-6">
        <div className="bg-plum-500 pointer-events-none absolute -top-7.5 -right-7.5 h-30 w-30 rounded-full opacity-20" />
        <div className="bg-lilac pointer-events-none absolute right-15 -bottom-5 h-20 w-20 rounded-full opacity-10" />
        <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-lilac mb-1 text-sm">Total Balance</p>
            <p className="font-display text-latte text-3xl font-semibold">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-blush mt-1 text-xs">
              ✦ {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </p>
          </div>
          {totalCreditUsed > 0 && (
            <div>
              <p className="text-lilac mb-1 text-sm">Total Credit Used</p>
              <p className="font-display text-latte text-3xl font-semibold">
                {formatCurrency(totalCreditUsed)}
              </p>
              <p className="text-blush mt-1 text-xs">across credit cards</p>
            </div>
          )}
        </div>
      </div>

      {/* wallets grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-3 text-4xl">⏳</p>
          <p className="text-plum font-semibold">Loading wallets…</p>
          <p className="text-lilac mt-1 text-sm">Fetching your latest balances</p>
        </div>
      ) : wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-3 text-4xl">👛</p>
          <p className="text-plum font-semibold">No wallets yet</p>
          <p className="text-lilac mt-1 text-sm">Add your first wallet to start tracking</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-plum text-latte hover:bg-plum-700 mt-4 rounded-full px-5 py-2.5 text-sm font-bold transition-colors"
          >
            + Add Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onDelete={fetchWallets}
              onEdit={fetchWallets}
            />
          ))}
        </div>
      )}

      {showModal && <AddWalletModal onClose={() => setShowModal(false)} onSuccess={fetchWallets} />}
    </div>
  )
}
