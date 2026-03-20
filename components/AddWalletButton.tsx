'use client'

import { useState } from 'react'
import AddWalletModal from '@/components/AddWalletModal'

export default function AddWalletButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-plum border-blush hover:bg-latte rounded-full border px-3 py-1.5 text-sm font-bold transition-colors"
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
