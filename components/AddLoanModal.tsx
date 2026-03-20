'use client'

import { useState } from 'react'
import { useLoans, LoanForm } from '@/hooks/useLoans'
import { parseAmount } from '@/utils/formatters'
import DatePicker from '@/components/DatePicker'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

const defaultForm: LoanForm = {
  person_name: '',
  direction: 'borrowed',
  principal_amount: 0,
  interest_rate: 0,
  monthly_payment: 0,
  due_date: '',
  notes: '',
}

export default function AddLoanModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<LoanForm>(defaultForm)
  const { addLoan, loading, error } = useLoans()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await addLoan(form)
    if (success) {
      onSuccess?.()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-plum-900 absolute inset-0 opacity-40" onClick={onClose} />

      <div className="border-blush relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-white p-6">
        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-plum text-2xl font-semibold">Add Loan ✦</p>
          <button
            onClick={onClose}
            className="text-lilac hover:text-plum text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* direction */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, direction: 'borrowed' })}
                className={`rounded-xl border-[1.5px] py-3 text-sm font-bold transition-all ${
                  form.direction === 'borrowed'
                    ? 'bg-plum text-latte border-plum'
                    : 'bg-latte text-plum border-blush hover:border-lilac'
                }`}
              >
                💸 I Borrowed
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, direction: 'lent' })}
                className={`rounded-xl border-[1.5px] py-3 text-sm font-bold transition-all ${
                  form.direction === 'lent'
                    ? 'bg-plum text-latte border-plum'
                    : 'bg-latte text-plum border-blush hover:border-lilac'
                }`}
              >
                💰 I Lent
              </button>
            </div>
          </div>

          {/* person name */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">
              {form.direction === 'borrowed' ? 'Lender Name' : 'Borrower Name'}
            </label>
            <input
              type="text"
              value={form.person_name}
              onChange={(e) => setForm({ ...form, person_name: e.target.value })}
              placeholder={
                form.direction === 'borrowed' ? 'e.g. Mama, BPI Bank' : 'e.g. Juan, Maria'
              }
              required
              className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] px-4 py-3 text-base transition-colors outline-none"
            />
          </div>

          {/* principal amount */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">Amount</label>
            <div className="relative">
              <span className="text-lilac absolute top-1/2 left-4 -translate-y-1/2 text-base font-semibold">
                ₱
              </span>
              <input
                type="number"
                value={form.principal_amount || ''}
                onChange={(e) =>
                  setForm({ ...form, principal_amount: parseAmount(e.target.value) })
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] py-3 pr-4 pl-9 text-base transition-colors outline-none"
              />
            </div>
          </div>

          {/* interest rate */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">
              Interest Rate <span className="text-lilac font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="text-lilac absolute top-1/2 right-4 -translate-y-1/2 text-base font-semibold">
                %
              </span>
              <input
                type="number"
                value={form.interest_rate || ''}
                onChange={(e) => setForm({ ...form, interest_rate: parseAmount(e.target.value) })}
                placeholder="0"
                min="0"
                step="0.01"
                className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] py-3 pr-9 pl-4 text-base transition-colors outline-none"
              />
            </div>
          </div>

          {/* due date */}
          <DatePicker
            label="Due Date (optional)"
            value={form.due_date}
            onChange={(v) => setForm({ ...form, due_date: v })}
          />

          {/* notes */}
          <div>
            <label className="text-plum mb-1.5 block text-sm font-semibold">
              Notes <span className="text-lilac font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. For tuition, Emergency fund"
              className="border-blush bg-latte text-plum focus:border-lilac w-full rounded-xl border-[1.5px] px-4 py-3 text-base transition-colors outline-none"
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
              {loading ? 'Adding...' : 'Add Loan ✦'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
