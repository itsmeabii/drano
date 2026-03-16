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

  const selected = options.find(o => o.value === value)

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
      {label && (
        <label className="block text-sm font-semibold text-plum mb-1.5">{label}</label>
      )}

      {/* trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 rounded-[12px] border-[1.5px] bg-latte text-base text-left flex items-center justify-between transition-colors font-body
          ${open ? 'border-lilac' : 'border-blush hover:border-lilac'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${selected ? 'text-plum' : 'text-lilac'}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span className={`text-lilac text-sm transition-transform ml-2 flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* options list */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-blush rounded-[12px] shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-colors font-body
                  ${opt.value === value
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