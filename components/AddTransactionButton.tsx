'use client'

import { useState } from 'react'
import AddTransactionModal from '@/components/AddTransactionModal'

export default function AddTransactionButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-plum text-latte text-sm font-bold px-5 py-2.5 rounded-full hover:bg-plum-700 transition-colors"
      >
        + Add Transaction
      </button>
      {showModal && (
        <AddTransactionModal onClose={() => setShowModal(false)} />
      )}
    </>
  )
}