'use client'

import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: Option[]
  label?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function Dropdown({
  value,
  onChange,
  options,
  label,
  required,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="text-plum mb-1.5 block text-sm font-semibold">{label}</label>}

      {/* trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`bg-latte font-body flex w-full items-center justify-between rounded-xl border-[1.5px] px-4 py-3 text-left text-base transition-colors ${open ? 'border-lilac' : 'border-blush hover:border-lilac'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${selected ? 'text-plum' : 'text-lilac'}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span
          className={`text-lilac ml-2 shrink-0 text-sm transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {/* options list */}
      {open && (
        <div className="border-blush absolute z-50 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
          <div className="max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`font-body w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  opt.value === value
                    ? 'bg-plum text-latte font-semibold'
                    : 'text-plum hover:bg-latte'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
