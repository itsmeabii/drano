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

  const filteredCategories = categories.filter((c) => c.type === form.type)
  const toWallets = wallets.filter((w) => w.id !== form.wallet_id)

  const walletOptions = wallets.map((w) => ({
    value: w.id,
    label: `${w.icon} ${w.name}`,
  }))

  const toWalletOptions = toWallets.map((w) => ({
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
      <div className="bg-plum-900 absolute inset-0 opacity-40" onClick={onClose} />

      <div className="border-blush relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-white p-6">
        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-plum text-2xl font-semibold">Add Transaction ✦</p>
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
            <label className="text-plum mb-1.5 block text-sm font-semibold">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Grocery run, Salary, Rent"
              required
              className="border-blush bg-latte text-plum focus:border-lilac font-body w-full rounded-xl border-[1.5px] px-4 py-3 text-base transition-colors outline-none"
            />
          </div>
          {/* type */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['expense', 'income', 'transfer'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type, category_id: null, to_wallet_id: null })}
                  className={`rounded-xl border-[1.5px] py-2.5 text-sm font-bold capitalize transition-all ${
                    form.type === type
                      ? 'bg-plum text-latte border-plum'
                      : 'bg-latte text-plum border-blush hover:border-lilac'
                  }`}
                >
                  {type === 'expense'
                    ? '💸 Expense'
                    : type === 'income'
                      ? '💰 Income'
                      : '🔄 Transfer'}
                </button>
              ))}
            </div>
          </div>

          {/* amount */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">Amount</label>
            <div className="relative">
              <span className="text-lilac absolute top-1/2 left-4 -translate-y-1/2 text-base font-semibold">
                ₱
              </span>
              {/* amount */}
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseAmount(e.target.value) })}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                className="border-blush bg-latte text-plum focus:border-lilac font-body w-full rounded-xl border-[1.5px] py-3 pr-4 pl-9 text-base transition-colors outline-none"
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
                <div className="border-blush bg-latte text-lilac w-full rounded-xl border-[1.5px] px-4 py-3 text-sm">
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
                <label className="text-plum mb-1.5 block text-sm font-semibold">
                  Transfer Fee <span className="text-lilac font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="text-lilac absolute top-1/2 left-4 -translate-y-1/2 text-base font-semibold">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={form.transfer_fee || ''}
                    onChange={(e) =>
                      setForm({ ...form, transfer_fee: parseAmount(e.target.value) })
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="border-blush bg-latte text-plum focus:border-lilac font-body w-full rounded-xl border-[1.5px] py-3 pr-4 pl-9 text-base transition-colors outline-none"
                  />
                </div>
                {form.transfer_fee > 0 && (
                  <p className="text-lilac mt-1 text-xs">
                    ✦ Total deducted from wallet: {formatCurrency(form.amount + form.transfer_fee)}
                  </p>
                )}
              </div>
            </>
          )}

          {/* category — not for transfer */}
          {form.type !== 'transfer' && (
            <div>
              <label className="text-plum mb-1.5 block text-sm font-semibold">Category</label>
              {filteredCategories.length === 0 ? (
                <div className="border-blush bg-latte text-lilac w-full rounded-xl border-[1.5px] px-4 py-3 text-sm">
                  No categories yet — add some in Categories
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, category_id: cat.id })}
                      className={`flex items-center gap-1.5 rounded-xl border-[1.5px] px-3 py-2 text-sm transition-all ${
                        form.category_id === cat.id
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
            <label className="text-plum mb-1.5 block text-sm font-semibold">
              Note <span className="text-lilac font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Grocery run at SM"
              className="border-blush bg-latte text-plum focus:border-lilac font-body w-full rounded-xl border-[1.5px] px-4 py-3 text-base transition-colors outline-none"
            />
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
              {loading ? 'Adding...' : 'Add Transaction ✦'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
