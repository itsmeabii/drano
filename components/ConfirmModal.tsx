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
      <div className="absolute inset-0 bg-plum-900 opacity-40" onClick={onCancel} />

      <div className="relative bg-white rounded-[24px] border border-blush w-full max-w-sm p-6 z-10">

        {/* icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-latte mx-auto mb-4">
          <span className="text-2xl">{danger ? '🗑️' : '⚠️'}</span>
        </div>

        {/* title */}
        <p className="font-display text-xl font-semibold text-plum text-center mb-2">
          {title}
        </p>

        {/* message */}
        <p className="text-lilac text-sm text-center mb-6">
          {message}
        </p>

        {/* buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-full border-[1.5px] border-blush text-plum text-base font-bold hover:bg-latte transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-full text-base font-bold transition-colors disabled:opacity-50
              ${danger
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