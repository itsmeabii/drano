'use client'

import { useState } from 'react'
import AddWalletModal from '@/components/AddWalletModal'

export default function AddWalletButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-plum font-bold border border-blush rounded-full px-3 py-1.5 hover:bg-latte transition-colors"
      >
        + Add
      </button>
      {showModal && (
        <AddWalletModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}