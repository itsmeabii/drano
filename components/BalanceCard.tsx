'use client'

import { useState } from 'react'
import { formatCurrency } from '@/utils/formatters'

interface Props {
  totalBalance: number
  spendableBalance: number
  savingsBalance: number
  walletCount: number
}

export default function BalanceCard({
  totalBalance,
  spendableBalance,
  savingsBalance,
  walletCount,
}: Props) {
  const [showTotal, setShowTotal] = useState(false)

  return (
    <div className="bg-plum rounded-[20px] p-6 mb-4 relative overflow-hidden">
      <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] rounded-full bg-plum-500 opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-20px] right-[60px] w-[80px] h-[80px] rounded-full bg-lilac opacity-10 pointer-events-none" />

      <div className="relative z-10">

        {/* spendable balance — always visible */}
        <p className="text-lilac text-sm mb-1">Spendable Balance</p>
        <p className="font-display text-5xl font-semibold text-latte">
          {formatCurrency(spendableBalance)}
        </p>
        <p className="text-blush text-xs mt-1">cash + debit only · excludes savings</p>

        <div className="h-px bg-plum-700 my-4" />

        {/* savings — always visible */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lilac text-sm">Savings</p>
            <p className="font-display text-2xl font-semibold text-latte">
              {formatCurrency(savingsBalance)}
            </p>
          </div>

          {/* total — hidden by default */}
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <p className="text-lilac text-sm">Total (all wallets)</p>
              <button
                onClick={() => setShowTotal(!showTotal)}
                className="text-lilac hover:text-latte transition-colors text-sm"
              >
                {showTotal ? '👁️' : '🙈'}
              </button>
            </div>
            <p className="font-display text-2xl font-semibold text-latte">
              {showTotal ? formatCurrency(totalBalance) : '₱ ••••••'}
            </p>
          </div>
        </div>

        <p className="text-blush text-xs">
          ✦ {walletCount} wallet{walletCount !== 1 ? 's' : ''}
        </p>

      </div>
    </div>
  )
}