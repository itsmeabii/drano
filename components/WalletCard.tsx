'use client'

import { useState } from 'react'
import { useWallets } from '@/hooks/useWallets'
import ConfirmModal from '@/components/ConfirmModal'
import EditWalletModal from '@/components/EditWalletModal'
import { formatCurrency } from '@/utils/formatters'
import { Pencil } from 'lucide-react'

interface Wallet {
  id: string
  name: string
  type: string
  balance: number
  credit_limit: number
  credit_used: number
  interest_rate: number
  icon: string
  color: string
}

interface Props {
  wallet: Wallet
  onDelete: () => void
  onEdit: () => void
}

export default function WalletCard({ wallet, onDelete, onEdit }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const { deleteWallet, loading } = useWallets()

  const handleDelete = async () => {
    await deleteWallet(wallet.id)
    setShowConfirm(false)
    onDelete()
  }

  const isCredit = wallet.type === 'credit'
  const creditUsedPct =
    isCredit && wallet.credit_limit > 0 ? (wallet.credit_used / wallet.credit_limit) * 100 : 0

  const barColor = creditUsedPct >= 90 ? '#a85c82' : creditUsedPct >= 60 ? '#C99E70' : '#5a9a7a'

  return (
    <>
      <div className="border-blush relative flex flex-col gap-3 overflow-hidden rounded-[20px] border bg-white p-5">
        {/* top color accent */}
        <div
          className="absolute top-0 right-0 left-0 h-1 rounded-t-[20px]"
          style={{ background: wallet.color ?? '#674188' }}
        />

        {/* header */}
        <div className="mt-1 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{ background: `${wallet.color}22` }}
            >
              {wallet.icon ?? '👛'}
            </div>
            <div>
              <p className="text-plum text-sm font-semibold">{wallet.name}</p>
              <p className="text-lilac text-xs capitalize">{wallet.type}</p>
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="text-lilac hover:text-plum text-xs transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="text-blush hover:text-expense text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* balance */}
        <div>
          <p className="text-lilac mb-0.5 text-xs">{isCredit ? 'Amount Owed' : 'Balance'}</p>
          <p className="font-display text-plum text-2xl font-semibold">
            {formatCurrency(wallet.balance)}
          </p>
        </div>

        {/* credit usage bar */}
        {isCredit && wallet.credit_limit > 0 && (
          <div>
            <div className="text-lilac mb-1 flex justify-between text-xs">
              <span>Credit Used</span>
              <span>
                {formatCurrency(wallet.credit_used)} / {formatCurrency(wallet.credit_limit)}
              </span>
            </div>
            <div className="bg-latte h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(creditUsedPct, 100)}%`, background: barColor }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs">
              {creditUsedPct > 100 ? (
                <span className="text-expense font-semibold">
                  ⚠️ Over limit by {formatCurrency(wallet.credit_used - wallet.credit_limit)}
                </span>
              ) : (
                <>
                  <span className="text-lilac">{creditUsedPct.toFixed(0)}% used</span>
                  <span className="text-income font-semibold">
                    {formatCurrency(wallet.credit_limit - wallet.credit_used)} remaining
                  </span>
                </>
              )}
            </div>
            {wallet.interest_rate > 0 && (
              <p className="text-lilac mt-1 text-xs">{wallet.interest_rate}% p.a. interest</p>
            )}
          </div>
        )}
      </div>

      {showEdit && (
        <EditWalletModal
          wallet={wallet}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false)
            onEdit()
          }}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          title="Delete Wallet"
          message={`Are you sure you want to delete "${wallet.name}"? This cannot be undone.`}
          confirmLabel="Delete Wallet"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
    </>
  )
}
