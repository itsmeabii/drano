'use client'

import { useState } from 'react'
import { useWallets, WalletForm } from '@/hooks/useWallets'
import { WALLET_TYPE_OPTIONS } from '@/constants/FilterOptions'
import { parseAmount } from '@/utils/formatters'
import { WALLET_COLORS, WALLET_ICONS } from '@/constants/Wallet'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

const defaultForm: WalletForm = {
  name: '',
  type: 'cash',
  balance: 0,
  credit_limit: 0,
  credit_used: 0,
  interest_rate: 0,
  icon: '👛',
  color: '#674188',
}

export default function AddWalletModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<WalletForm>(defaultForm)
  const { addWallet, loading, error } = useWallets()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await addWallet(form)
    if (success) {
      onSuccess?.()
      onClose()
    }
  }
  
  const isCredit = form.type === 'credit'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-plum-900 opacity-40"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[24px] border border-blush w-full max-w-lg p-6 z-10 max-h-[80vh] overflow-y-auto">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-display text-2xl font-semibold text-plum">Add Wallet ✦</p>
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
            <label className="block text-sm font-semibold text-plum mb-1.5">Wallet Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. BPI Savings"
              required
              className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors"
            />
          </div>

          {/* type */}
          <div>
            <label className="block text-sm font-semibold text-plum mb-1.5">Wallet Type</label>
            <div className="grid grid-cols-2 gap-2">
              {WALLET_TYPE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, type: value as WalletForm['type'] })}
                  className={`py-2.5 rounded-[12px] text-sm font-bold border-[1.5px] transition-all
                    ${form.type === value
                      ? 'bg-plum text-latte border-plum'
                      : 'bg-latte text-plum border-blush hover:border-lilac'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* balance */}
          <div>
            <label className="block text-sm font-semibold text-plum mb-1.5">
              {isCredit ? 'Current Balance (what you owe)' : 'Current Balance'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac text-base font-semibold">₱</span>
              <input
                type="number"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: parseAmount(e.target.value) })}
                onFocus={(e) => { if (e.target.value === '0') e.target.value = '' }}
                onBlur={(e) => { if (e.target.value === '') e.target.value = '0' }}
                min="0"
                step="0.01"
                required
                className="w-full pl-9 pr-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors"
              />
            </div>
          </div>

          {/* credit fields */}
          {isCredit && (
            <>
              <div>
                <label className="block text-sm font-semibold text-plum mb-1.5">Credit Limit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac text-base font-semibold">₱</span>
                  <input
                    type="number"
                    value={form.credit_limit}
                    onChange={(e) => setForm({ ...form, credit_limit: parseAmount(e.target.value) })}
                    onFocus={(e) => { if (e.target.value === '0') e.target.value = '' }}
                    onBlur={(e) => { if (e.target.value === '') e.target.value = '0' }}
                    min="0"
                    step="0.01"
                    className="w-full pl-9 pr-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-plum mb-1.5">Credit Used</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac text-base font-semibold">₱</span>
                  <input
                    type="number"
                    value={form.credit_used}
                    onChange={(e) => setForm({ ...form, credit_used: parseAmount(e.target.value) })}
                    onFocus={(e) => { if (e.target.value === '0') e.target.value = '' }}
                    onBlur={(e) => { if (e.target.value === '') e.target.value = '0' }}
                    min="0"
                    step="0.01"
                    className="w-full pl-9 pr-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-plum mb-1.5">Interest Rate (% per annum)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lilac text-base font-semibold">%</span>
                  <input
                    type="number"
                    value={form.interest_rate}
                    onChange={(e) => setForm({ ...form, interest_rate: parseAmount(e.target.value) })}
                    onFocus={(e) => { if (e.target.value === '0') e.target.value = '' }}
                    onBlur={(e) => { if (e.target.value === '') e.target.value = '0' }}
                    min="0"
                    step="0.01"
                    className="w-full pl-4 pr-9 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* icon */}
          <div>
            <label className="block text-sm font-semibold text-plum mb-1.5">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-11 h-11 rounded-[10px] text-xl border-[1.5px] transition-all
                    ${form.icon === icon
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
            <label className="block text-sm font-semibold text-plum mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all
                    ${form.color === color ? 'border-plum scale-110' : 'border-transparent'}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-[#fdf0f5] border border-blush rounded-[10px] px-4 py-3 text-sm text-expense">
              {error}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border-[1.5px] border-blush text-plum text-base font-bold hover:bg-latte transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-full bg-plum text-latte text-base font-bold hover:bg-plum-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Wallet ✦'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}