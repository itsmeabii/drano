'use client'

import { useState } from 'react'
import AddTransactionModal from '@/components/AddTransactionModal'

export default function AddTransactionButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-plum text-latte hover:bg-plum-700 rounded-full px-5 py-2.5 text-sm font-bold transition-colors"
      >
        + Add Transaction
      </button>
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </>
  )
}
