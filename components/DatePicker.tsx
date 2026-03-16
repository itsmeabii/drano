'use client'

import { useState, useRef, useEffect } from 'react'
import { MONTHS, DAYS} from "@/constants/Calendar";

interface Props {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

export default function DatePicker({ value, onChange, label, required }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const today = new Date()
  const selected = value ? new Date(value + 'T00:00:00') : null

  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handleSelect = (day: number) => {
    const month = String(viewMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    onChange(`${viewYear}-${month}-${dayStr}`)
    setOpen(false)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return selected.getFullYear() === viewYear &&
      selected.getMonth() === viewMonth &&
      selected.getDate() === day
  }

  const isToday = (day: number) => {
    return today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  return (
    <div ref={ref} className="relative flex-1">
      {label && (
        <label className="block text-sm font-semibold text-plum mb-1.5">{label}</label>
      )}

      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 rounded-[12px] border-[1.5px] bg-latte text-base text-left flex items-center justify-between transition-colors font-body
          ${open ? 'border-lilac' : 'border-blush hover:border-lilac'}
          ${value ? 'text-plum' : 'text-lilac'}`}
      >
        <span className="truncate">{value ? formatDisplay(value) : 'Select date'}</span>
        <span className="text-lilac text-sm ml-2 flex-shrink-0"></span>
      </button>

      {/* calendar */}
      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-blush rounded-[18px] shadow-lg p-4 w-[280px]">

          {/* header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full hover:bg-latte transition-colors text-plum font-bold flex items-center justify-center"
            >
              ‹
            </button>
            <p className="font-display text-sm font-semibold text-plum">
              {MONTHS[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full hover:bg-latte transition-colors text-plum font-bold flex items-center justify-center"
            >
              ›
            </button>
          </div>

          {/* day labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-lilac py-1">
                {d}
              </div>
            ))}
          </div>

          {/* days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {/* empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* day buttons */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={`w-8 h-8 mx-auto rounded-full text-sm transition-all font-body
                    ${isSelected(day)
                      ? 'bg-plum text-latte font-semibold'
                      : isToday(day)
                        ? 'border-[1.5px] border-plum text-plum font-semibold hover:bg-latte'
                        : 'text-plum hover:bg-latte'
                    }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* clear */}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full mt-3 py-2 text-xs text-lilac hover:text-expense font-semibold transition-colors border-t border-blush pt-3"
            >
              Clear date
            </button>
          )}

        </div>
      )}
    </div>
  )
}