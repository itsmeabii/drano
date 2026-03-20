'use client'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  danger?: boolean
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-plum-900 absolute inset-0 opacity-40" onClick={onCancel} />

      <div className="border-blush relative z-10 w-full max-w-sm rounded-3xl border bg-white p-6">
        {/* icon */}
        <div className="bg-latte mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <span className="text-2xl">{danger ? '🗑️' : '⚠️'}</span>
        </div>

        {/* title */}
        <p className="font-display text-plum mb-2 text-center text-xl font-semibold">{title}</p>

        {/* message */}
        <p className="text-lilac mb-6 text-center text-sm">{message}</p>

        {/* buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="border-blush text-plum hover:bg-latte flex-1 rounded-full border-[1.5px] py-3 text-base font-bold transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-full py-3 text-base font-bold transition-colors disabled:opacity-50 ${
              danger
                ? 'bg-expense text-white hover:opacity-80'
                : 'bg-plum text-latte hover:bg-plum-700'
            }`}
          >
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
