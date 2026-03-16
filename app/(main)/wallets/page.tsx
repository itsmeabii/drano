'use client'

import { useState } from 'react'
import { useWallets } from '@/hooks/useWallets'
import WalletCard from '@/components/WalletCard'
import AddWalletModal from '@/components/AddWalletModal'
import { formatCurrency } from '@/utils/formatters'

export default function WalletsPage() {
  const [showModal, setShowModal] = useState(false)
  const { wallets, fetchWallets } = useWallets() 

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance ?? 0), 0)
  const totalCreditUsed = wallets
    .filter(w => w.type === 'credit')
    .reduce((sum, w) => sum + (w.credit_used ?? 0), 0)

  // ← remove the local fetchWallets that throws an error!

  return (
    <div className="p-4 md:p-8">

      {/* header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-plum">My Wallets ✦</h1>
          <p className="text-lilac text-sm mt-1">Manage your cash, debit and credit accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-plum text-latte text-sm font-bold px-5 py-2.5 rounded-full hover:bg-plum-700 transition-colors"
        >
          + Add Wallet
        </button>
      </div>

      {/* total balance card */}
      <div className="bg-plum rounded-[20px] p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] rounded-full bg-plum-500 opacity-20 pointer-events-none" />
        <div className="absolute bottom-[-20px] right-[60px] w-[80px] h-[80px] rounded-full bg-lilac opacity-10 pointer-events-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div>
            <p className="text-lilac text-sm mb-1">Total Balance</p>
            <p className="font-display text-3xl font-semibold text-latte">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-blush text-xs mt-1">
              ✦ {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </p>
          </div>
          {totalCreditUsed > 0 && (
            <div>
              <p className="text-lilac text-sm mb-1">Total Credit Used</p>
              <p className="font-display text-3xl font-semibold text-latte">
                {formatCurrency(totalCreditUsed)}
              </p>
              <p className="text-blush text-xs mt-1">across credit cards</p>
            </div>
          )}
        </div>
      </div>

      {/* wallets grid */}
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-3">👛</p>
          <p className="text-plum font-semibold">No wallets yet</p>
          <p className="text-lilac text-sm mt-1">Add your first wallet to start tracking</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-plum text-latte text-sm font-bold px-5 py-2.5 rounded-full hover:bg-plum-700 transition-colors"
          >
            + Add Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {showModal && (
        <AddWalletModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchWallets}
        />
      )}

    </div>
  )
}