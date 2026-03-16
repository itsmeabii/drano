'use client'

import { useState } from 'react'
import { useTransactions, TransactionForm } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import Dropdown from '@/components/Dropdown'
import DatePicker from '@/components/DatePicker'
import { formatCurrency, parseAmount } from '@/utils/formatters'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

const defaultForm: TransactionForm = {
  name: '',
  wallet_id: '',
  to_wallet_id: null,
  category_id: null,
  type: 'expense',
  amount: 0,
  transfer_fee: 0,
  note: '',
  date: new Date().toISOString().split('T')[0],
}

export default function AddTransactionModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<TransactionForm>(defaultForm)
  const { addTransaction, loading, error } = useTransactions()
  const { wallets } = useWallets()
  const categories = useCategories()

  const filteredCategories = categories.filter(c => c.type === form.type)
  const toWallets = wallets.filter(w => w.id !== form.wallet_id)

  const walletOptions = wallets.map(w => ({
    value: w.id,
    label: `${w.icon} ${w.name}`,
  }))

  const toWalletOptions = toWallets.map(w => ({
    value: w.id,
    label: `${w.icon} ${w.name}`,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.type === 'transfer' && !form.to_wallet_id) return
    const success = await addTransaction(form)
    if (success) {
      onSuccess?.()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-plum-900 opacity-40" onClick={onClose} />

      <div className="relative bg-white rounded-[24px] border border-blush w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-display text-2xl font-semibold text-plum">Add Transaction ✦</p>
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
            <label className="block text-sm font-semibold text-plum mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Grocery run, Salary, Rent"
              required
              className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors font-body"
            />
          </div>
          {/* type */}
          <div>
            <label className="block text-sm font-semibold text-plum mb-1.5">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['expense', 'income', 'transfer'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type, category_id: null, to_wallet_id: null })}
                  className={`py-2.5 rounded-[12px] text-sm font-bold capitalize border-[1.5px] transition-all
                    ${form.type === type
                      ? 'bg-plum text-latte border-plum'
                      : 'bg-latte text-plum border-blush hover:border-lilac'
                    }`}
                >
                  {type === 'expense' ? '💸 Expense' : type === 'income' ? '💰 Income' : '🔄 Transfer'}
                </button>
              ))}
            </div>
          </div>

          {/* amount */}
          <div>
            <label className="block text-sm font-semibold text-plum mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac text-base font-semibold">₱</span>
              {/* amount */}
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseAmount(e.target.value) })}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                className="w-full pl-9 pr-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors font-body"
              />
            </div>
          </div>

          {/* from wallet */}
          <Dropdown
            label={form.type === 'transfer' ? 'From Wallet' : 'Wallet'}
            value={form.wallet_id}
            onChange={(v) => setForm({ ...form, wallet_id: v, to_wallet_id: null })}
            options={walletOptions}
            placeholder="Select a wallet"
            required
          />

          {/* to wallet — transfer only */}
          {form.type === 'transfer' && (
            <>
              {toWallets.length === 0 ? (
                <div className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-sm text-lilac">
                  You need at least 2 wallets to transfer
                </div>
              ) : (
                <Dropdown
                  label="To Wallet"
                  value={form.to_wallet_id ?? ''}
                  onChange={(v) => setForm({ ...form, to_wallet_id: v })}
                  options={toWalletOptions}
                  placeholder="Select destination wallet"
                  required
                />
              )}

              {/* transfer fee */}
              <div>
                <label className="block text-sm font-semibold text-plum mb-1.5">
                  Transfer Fee <span className="text-lilac font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac text-base font-semibold">₱</span>
                  <input
                    type="number"
                    value={form.transfer_fee || ''}
                    onChange={(e) => setForm({ ...form, transfer_fee: parseAmount(e.target.value) })}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors font-body"
                  />
                </div>
                {form.transfer_fee > 0 && (
                  <p className="text-xs text-lilac mt-1">
                    ✦ Total deducted from wallet: {formatCurrency(form.amount + form.transfer_fee)}
                  </p>
                )}
              </div>
            </>
          )}

          {/* category — not for transfer */}
          {form.type !== 'transfer' && (
            <div>
              <label className="block text-sm font-semibold text-plum mb-1.5">Category</label>
              {filteredCategories.length === 0 ? (
                <div className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-sm text-lilac">
                  No categories yet — add some in Categories
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, category_id: cat.id })}
                      className={`py-2 px-3 rounded-[12px] text-sm border-[1.5px] transition-all flex items-center gap-1.5
                        ${form.category_id === cat.id
                          ? 'bg-plum text-latte border-plum'
                          : 'bg-latte text-plum border-blush hover:border-lilac'
                        }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* date */}
          <DatePicker
            label="Date"
            value={form.date}
            onChange={(v) => setForm({ ...form, date: v })}
            required
          />

          {/* note */}
          <div>
            <label className="block text-sm font-semibold text-plum mb-1.5">
              Note <span className="text-lilac font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Grocery run at SM"
              className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-blush bg-latte text-base text-plum outline-none focus:border-lilac transition-colors font-body"
            />
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
              {loading ? 'Adding...' : 'Add Transaction ✦'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}