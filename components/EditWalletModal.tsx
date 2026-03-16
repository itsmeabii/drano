'use client'

import { useState } from 'react'
import { useWallets, Wallet, WalletForm } from '@/hooks/useWallets'
import { WALLET_TYPE_OPTIONS } from '@/constants/FilterOptions'
import { parseAmount } from '@/utils/formatters'
import { WALLET_COLORS, WALLET_ICONS } from '@/constants/Wallet'

interface Props {
  wallet: Wallet
  onClose: () => void
  onSuccess?: () => void
}

export default function EditWalletModal({ wallet, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<WalletForm>({
    name: wallet.name,
    type: wallet.type as WalletForm['type'],
    balance: wallet.balance,
    credit_limit: wallet.credit_limit,
    credit_used: wallet.credit_used,
    interest_rate: wallet.interest_rate,
    icon: wallet.icon,
    color: wallet.color,
  })

  const { updateWallet, loading, error } = useWallets()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await updateWallet(wallet.id, form)
    if (success) {
      onSuccess?.()
      onClose()
    }
  }

  const isCredit = form.type === 'credit'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-plum-900 absolute inset-0 opacity-40" onClick={onClose} />

      <div className="border-blush relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl border bg-white p-6">
        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-plum text-2xl font-semibold">Edit Wallet ✦</p>
          <button
            onClick={onClose}
            className="text-lilac hover:text-plum text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* name */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">Wallet Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. BPI Savings"
              required
              className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] px-4 py-3 text-base transition-colors outline-none"
            />
          </div>

          {/* type */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">Wallet Type</label>
            <div className="grid grid-cols-2 gap-2">
              {WALLET_TYPE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, type: value as WalletForm['type'] })}
                  className={`rounded-xl border-[1.5px] py-2.5 text-sm font-bold transition-all ${
                    form.type === value
                      ? 'bg-plum text-latte border-plum'
                      : 'bg-latte text-plum border-blush hover:border-lilac'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* balance — not for credit */}
          {!isCredit && (
            <div>
              <label className="text-plum mb-1.5 block text-sm font-semibold">
                Current Balance
              </label>
              <div className="relative">
                <span className="text-lilac absolute top-1/2 left-4 -translate-y-1/2 text-base font-semibold">
                  ₱
                </span>
                <input
                  type="number"
                  value={form.balance || ''}
                  onChange={(e) => setForm({ ...form, balance: parseAmount(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] py-3 pr-4 pl-9 text-base transition-colors outline-none"
                />
              </div>
            </div>
          )}

          {/* credit fields */}
          {isCredit && (
            <>
              <div>
                <label className="text-plum mb-1.5 block text-sm font-semibold">Credit Limit</label>
                <div className="relative">
                  <span className="text-lilac absolute top-1/2 left-4 -translate-y-1/2 text-base font-semibold">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={form.credit_limit || ''}
                    onChange={(e) =>
                      setForm({ ...form, credit_limit: parseAmount(e.target.value) })
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] py-3 pr-4 pl-9 text-base transition-colors outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-plum mb-1.5 block text-sm font-semibold">Credit Used</label>
                <div className="relative">
                  <span className="text-lilac absolute top-1/2 left-4 -translate-y-1/2 text-base font-semibold">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={form.credit_used || ''}
                    onChange={(e) => setForm({ ...form, credit_used: parseAmount(e.target.value) })}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] py-3 pr-4 pl-9 text-base transition-colors outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-plum mb-1.5 block text-sm font-semibold">
                  Interest Rate (% per annum)
                </label>
                <div className="relative">
                  <span className="text-lilac absolute top-1/2 right-4 -translate-y-1/2 text-base font-semibold">
                    %
                  </span>
                  <input
                    type="number"
                    value={form.interest_rate || ''}
                    onChange={(e) =>
                      setForm({ ...form, interest_rate: parseAmount(e.target.value) })
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] py-3 pr-9 pl-4 text-base transition-colors outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* icon */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">Icon</label>
            <div className="flex flex-wrap gap-2">
              {WALLET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`h-11 w-11 rounded-[10px] border-[1.5px] text-xl transition-all ${
                    form.icon === icon
                      ? 'border-plum bg-plum-100'
                      : 'border-blush bg-latte hover:border-lilac'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* color */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">Color</label>
            <div className="flex flex-wrap gap-2">
              {WALLET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${form.color === color ? 'border-plum scale-110' : 'border-transparent'}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="border-blush text-expense rounded-[10px] border bg-[#fdf0f5] px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border-blush text-plum hover:bg-latte flex-1 rounded-full border-[1.5px] py-3 text-base font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-plum text-latte hover:bg-plum-700 flex-1 rounded-full py-3 text-base font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes ✦'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
