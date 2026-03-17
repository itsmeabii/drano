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
    <div className="bg-plum relative mb-4 overflow-hidden rounded-[20px] px-6 py-4">
      <div className="bg-plum-500 pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full opacity-20" />
      <div className="bg-lilac pointer-events-none absolute -top-1 -left-5 h-28 w-28 rounded-full opacity-10" />
      <div className="relative z-10">
        {/* spendable balance — always visible */}
        <p className="text-lilac mb-1 text-base">Spendable Balance</p>
        <p className="font-display text-latte text-5xl font-semibold">
          {formatCurrency(spendableBalance)}
        </p>
        <p className="text-blush mt-1 text-sm">cash + debit only · excludes savings</p>

        <div className="bg-plum-700 my-3 h-px" />

        {/* savings — always visible */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-lilac text-base">Savings</p>
            <p className="font-display text-latte text-2xl font-semibold">
              {formatCurrency(savingsBalance)}
            </p>
          </div>

          {/* total — hidden by default */}
          <div className="text-right">
            <div className="mb-1 flex items-center justify-end gap-2">
              <p className="text-lilac text-base">Total (all wallets)</p>
              <button
                onClick={() => setShowTotal(!showTotal)}
                className="text-lilac hover:text-latte text-sm transition-colors"
              >
                {showTotal ? '👁️' : '🙈'}
              </button>
            </div>
            <p className="font-display text-latte text-2xl font-semibold">
              {showTotal ? formatCurrency(totalBalance) : '₱ ••••••'}
            </p>
          </div>
        </div>

        <p className="text-blush text-sm">
          ✦ {walletCount} wallet{walletCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
