'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface Loan {
  id: string
  user_id: string
  person_name: string
  direction: 'borrowed' | 'lent'
  principal_amount: number
  amount_paid: number
  remaining_balance: number
  interest_rate: number
  monthly_payment: number
  due_date: string | null
  status: 'active' | 'paid'
  notes: string | null
  created_at: string
}

export interface LoanPayment {
  id: string
  loan_id: string
  amount: number
  note: string | null
  date: string
}

export interface LoanForm {
  person_name: string
  direction: 'borrowed' | 'lent'
  principal_amount: number
  interest_rate: number
  monthly_payment: number
  due_date: string
  notes: string
}

const n = (v: unknown) => parseFloat(String(v ?? 0)) || 0

const normalizeLoan = (loan: Loan): Loan => ({
  ...loan,
  principal_amount: n(loan.principal_amount),
  amount_paid: n(loan.amount_paid),
  remaining_balance: n(loan.remaining_balance),
  interest_rate: n(loan.interest_rate),
  monthly_payment: n(loan.monthly_payment),
})

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [payments, setPayments] = useState<Record<string, LoanPayment[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const fetchLoans = async () => {
    const { data } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false })
    setLoans(data?.map(normalizeLoan) ?? [])
  }

  const fetchPayments = async (loanId: string) => {
    const { data } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('date', { ascending: false })

    setPayments((prev) => ({
      ...prev,
      [loanId]: data?.map((p) => ({ ...p, amount: n(p.amount) })) ?? [],
    }))
  }

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false })
      setLoans(data?.map(normalizeLoan) ?? [])
    }
    load()
  }, [])

  const addLoan = async (form: LoanForm) => {
    setLoading(true)
    setError('')
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error } = await supabase.from('loans').insert({
        user_id: user.id,
        person_name: form.person_name,
        direction: form.direction,
        principal_amount: form.principal_amount,
        remaining_balance: form.principal_amount,
        interest_rate: form.interest_rate,
        monthly_payment: form.monthly_payment,
        due_date: form.due_date || null,
        notes: form.notes || null,
        amount_paid: 0,
        status: 'active',
      })

      if (error) throw error
      await fetchLoans()
      router.refresh()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  const addPayment = async (loanId: string, amount: number, note: string, date: string) => {
    setLoading(true)
    setError('')
    try {
      const loan = loans.find((l) => l.id === loanId)
      if (!loan) throw new Error('Loan not found')

      const { error: payError } = await supabase.from('loan_payments').insert({
        loan_id: loanId,
        amount,
        note,
        date,
      })
      if (payError) throw payError

      const newAmountPaid = loan.amount_paid + amount
      const newRemaining = Math.max(0, loan.principal_amount - newAmountPaid)
      const isPaid = newRemaining <= 0

      const { error: loanError } = await supabase
        .from('loans')
        .update({
          amount_paid: newAmountPaid,
          remaining_balance: newRemaining,
          status: isPaid ? 'paid' : 'active',
        })
        .eq('id', loanId)

      if (loanError) throw loanError

      await fetchLoans()
      await fetchPayments(loanId)
      router.refresh()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteLoan = async (id: string) => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.from('loans').delete().eq('id', id)
      if (error) throw error
      await fetchLoans()
      router.refresh()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  const borrowedLoans = loans.filter((l) => l.direction === 'borrowed')
  const lentLoans = loans.filter((l) => l.direction === 'lent')
  const totalBorrowed = borrowedLoans.reduce((s, l) => s + l.remaining_balance, 0)
  const totalLent = lentLoans.reduce((s, l) => s + l.remaining_balance, 0)

  return {
    loans,
    borrowedLoans,
    lentLoans,
    payments,
    loading,
    error,
    fetchLoans,
    fetchPayments,
    addLoan,
    addPayment,
    deleteLoan,
    totalBorrowed,
    totalLent,
  }
}
