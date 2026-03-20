'use client'

import { useState } from 'react'
import { useLoans } from '@/hooks/useLoans'
import { formatCurrency, formatDate, parseAmount } from '@/utils/formatters'
import ConfirmModal from '@/components/ConfirmModal'
import AddLoanModal from '@/components/AddLoanModal'
import DatePicker from '@/components/DatePicker'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function LoansPage() {
  const {
    borrowedLoans,
    lentLoans,
    payments,
    loading,
    fetchPayments,
    fetchLoans,
    addPayment,
    deleteLoan,
    totalBorrowed,
    totalLent,
  } = useLoans()

  const [tab, setTab] = useState<'borrowed' | 'lent'>('borrowed')
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [paymentInputs, setPaymentInputs] = useState<
    Record<string, { amount: string; note: string; date: string }>
  >({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const currentLoans = tab === 'borrowed' ? borrowedLoans : lentLoans

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    await fetchPayments(id)
    if (!paymentInputs[id]) {
      setPaymentInputs((prev) => ({
        ...prev,
        [id]: { amount: '', note: '', date: new Date().toISOString().split('T')[0] },
      }))
    }
  }

  const handleAddPayment = async (loanId: string) => {
    const input = paymentInputs[loanId]
    if (!input || !input.amount) return
    const success = await addPayment(loanId, parseAmount(input.amount), input.note, input.date)
    if (success) {
      setPaymentInputs((prev) => ({
        ...prev,
        [loanId]: { amount: '', note: '', date: new Date().toISOString().split('T')[0] },
      }))
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-plum text-3xl font-semibold">Loans ✦</h1>
          <p className="text-lilac mt-1 text-base">Track what you owe and what you&apos;re owed</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-plum text-latte hover:bg-plum-700 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors"
        >
          <Plus size={16} /> Add Loan
        </button>
      </div>

      {/* summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border-blush rounded-[18px] border bg-white p-5">
          <p className="text-lilac mb-1 text-sm">I Owe (Borrowed)</p>
          <p className="font-display text-expense text-3xl font-semibold">
            {formatCurrency(totalBorrowed)}
          </p>
          <p className="text-lilac mt-1 text-xs">
            {borrowedLoans.filter((l) => l.status === 'active').length} active loans
          </p>
        </div>
        <div className="border-blush rounded-[18px] border bg-white p-5">
          <p className="text-lilac mb-1 text-sm">Owed to Me (Lent)</p>
          <p className="font-display text-income text-3xl font-semibold">
            {formatCurrency(totalLent)}
          </p>
          <p className="text-lilac mt-1 text-xs">
            {lentLoans.filter((l) => l.status === 'active').length} active loans
          </p>
        </div>
      </div>

      {/* tabs */}
      <div className="mb-6 flex gap-2">
        {(['borrowed', 'lent'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border-[1.5px] px-5 py-2 text-sm font-bold capitalize transition-all ${
              tab === t
                ? 'bg-plum text-latte border-plum'
                : 'text-plum border-blush hover:border-lilac bg-white'
            }`}
          >
            {t === 'borrowed' ? '💸 I Borrowed' : '💰 I Lent'}
          </button>
        ))}
      </div>

      {/* loans list */}
      {currentLoans.length === 0 ? (
        <div className="border-blush flex flex-col items-center justify-center rounded-[18px] border bg-white py-16 text-center">
          <p className="mb-3 text-4xl">{tab === 'borrowed' ? '💸' : '💰'}</p>
          <p className="text-plum text-base font-semibold">
            {tab === 'borrowed' ? 'No borrowed loans' : 'No lent loans'}
          </p>
          <p className="text-lilac mt-1 text-sm">Click Add Loan to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {currentLoans.map((loan) => {
            const progress =
              loan.principal_amount > 0 ? (loan.amount_paid / loan.principal_amount) * 100 : 0
            const isExpanded = expandedId === loan.id
            const loanPayments = payments[loan.id] ?? []
            const payInput = paymentInputs[loan.id]

            return (
              <div
                key={loan.id}
                className="border-blush overflow-hidden rounded-[18px] border bg-white"
              >
                <div className="p-5">
                  {/* header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-plum text-base font-semibold">{loan.person_name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            loan.status === 'paid'
                              ? 'bg-latte text-income'
                              : 'bg-latte text-expense'
                          }`}
                        >
                          {loan.status === 'paid' ? '✓ Paid' : 'Active'}
                        </span>
                      </div>
                      {loan.due_date && (
                        <p className="text-lilac mt-0.5 text-xs">
                          Due: {formatDate(loan.due_date)}
                        </p>
                      )}
                      {loan.notes && (
                        <p className="text-lilac mt-0.5 text-xs italic">{loan.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setConfirmDelete(loan.id)}
                      className="text-blush hover:text-expense transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* amounts */}
                  <div className="mb-3 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-lilac text-xs">Principal</p>
                      <p className="font-display text-plum text-base font-semibold">
                        {formatCurrency(loan.principal_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-lilac text-xs">Paid</p>
                      <p className="font-display text-income text-base font-semibold">
                        {formatCurrency(loan.amount_paid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-lilac text-xs">Remaining</p>
                      <p className="font-display text-expense text-base font-semibold">
                        {formatCurrency(loan.remaining_balance)}
                      </p>
                    </div>
                  </div>

                  {/* progress bar */}
                  <div className="mb-3">
                    <div className="bg-latte h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-plum h-full rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-lilac mt-1 text-xs">{progress.toFixed(0)}% paid</p>
                  </div>

                  {/* expand button */}
                  {loan.status === 'active' && (
                    <button
                      onClick={() => handleExpand(loan.id)}
                      className="border-blush text-plum hover:bg-plum-600 flex w-full items-center justify-center gap-1.5 rounded-full border-[1.5px] py-2 text-xs font-bold transition-colors hover:text-white"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {isExpanded ? 'Hide' : 'Add Payment & History'}
                    </button>
                  )}
                </div>

                {/* expanded section */}
                {isExpanded && (
                  <div className="bg-latte border-blush border-t p-5">
                    {/* add payment */}
                    {payInput && (
                      <div className="mb-4">
                        <p className="text-plum mb-3 text-sm font-semibold">Record Payment</p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div className="relative h-12 w-full">
                            <span className="text-lilac absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold">
                              ₱
                            </span>
                            <input
                              type="number"
                              value={payInput.amount}
                              onChange={(e) =>
                                setPaymentInputs((prev) => ({
                                  ...prev,
                                  [loan.id]: { ...prev[loan.id], amount: e.target.value },
                                }))
                              }
                              placeholder="Amount"
                              className="border-blush text-plum focus:border-lilac h-[42px] w-full rounded-xl border-[1.5px] bg-white pr-4 pl-9 text-sm transition-colors outline-none"
                            />
                          </div>
                          <input
                            type="text"
                            value={payInput.note}
                            onChange={(e) =>
                              setPaymentInputs((prev) => ({
                                ...prev,
                                [loan.id]: { ...prev[loan.id], note: e.target.value },
                              }))
                            }
                            placeholder="Note (optional)"
                            className="border-blush text-plum focus:border-lilac h-12 w-full rounded-xl border-[1.5px] bg-white px-4 text-sm transition-colors outline-none"
                          />
                          <div className="h-12 w-full">
                            <DatePicker
                              value={payInput.date}
                              onChange={(v) =>
                                setPaymentInputs((prev) => ({
                                  ...prev,
                                  [loan.id]: { ...prev[loan.id], date: v },
                                }))
                              }
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddPayment(loan.id)}
                          disabled={loading || !payInput.amount}
                          className="bg-plum text-latte hover:bg-plum-700 mt-3 w-full rounded-full py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Adding...' : 'Record Payment ✦'}
                        </button>
                      </div>
                    )}

                    {/* payment history */}
                    {loanPayments.length > 0 ? (
                      <div>
                        <p className="text-plum mb-3 text-sm font-semibold">Payment History</p>
                        <div className="flex flex-col gap-2">
                          {loanPayments.map((payment) => (
                            <div
                              key={payment.id}
                              className="border-blush flex flex-wrap items-center justify-between gap-2 rounded-[12px] border bg-white px-4 py-2.5"
                            >
                              <div>
                                <p className="text-plum text-sm font-semibold">
                                  {formatCurrency(payment.amount)}
                                </p>
                                {payment.note && (
                                  <p className="text-lilac text-xs">{payment.note}</p>
                                )}
                              </div>
                              <p className="text-lilac text-xs">{formatDate(payment.date)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-lilac text-center text-sm">No payments recorded yet</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && <AddLoanModal onClose={() => setShowModal(false)} onSuccess={fetchLoans} />}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Loan"
          message="Are you sure you want to delete this loan? All payment history will be lost."
          confirmLabel="Delete Loan"
          onConfirm={() => {
            deleteLoan(confirmDelete)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
