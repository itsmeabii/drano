'use client'

import { useState, useRef, useEffect } from 'react'
import { MONTHS, DAYS } from '@/constants/Calendar'

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
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else setViewMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else setViewMonth((m) => m + 1)
  }

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getFullYear() === viewYear &&
      selected.getMonth() === viewMonth &&
      selected.getDate() === day
    )
  }

  const isToday = (day: number) => {
    return (
      today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
    )
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  return (
    <div ref={ref} className="relative flex-1">
      {label && <label className="text-plum mb-1.5 block text-sm font-semibold">{label}</label>}

      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`bg-latte font-body flex w-full items-center justify-between rounded-[12px] border-[1.5px] px-4 py-3 text-left text-base transition-colors ${open ? 'border-lilac' : 'border-blush hover:border-lilac'} ${value ? 'text-plum' : 'text-lilac'}`}
      >
        <span className="truncate">{value ? formatDisplay(value) : 'Select date'}</span>
        <span className="text-lilac ml-2 flex-shrink-0 text-sm"></span>
      </button>

      {/* calendar */}
      {open && (
        <div className="border-blush absolute z-50 mt-1 w-[280px] rounded-[18px] border bg-white p-4 shadow-lg">
          {/* header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="hover:bg-latte text-plum flex h-8 w-8 items-center justify-center rounded-full font-bold transition-colors"
            >
              ‹
            </button>
            <p className="font-display text-plum text-sm font-semibold">
              {MONTHS[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="hover:bg-latte text-plum flex h-8 w-8 items-center justify-center rounded-full font-bold transition-colors"
            >
              ›
            </button>
          </div>

          {/* day labels */}
          <div className="mb-1 grid grid-cols-7">
            {DAYS.map((d) => (
              <div key={d} className="text-lilac py-1 text-center text-[11px] font-semibold">
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
                  className={`font-body mx-auto h-8 w-8 rounded-full text-sm transition-all ${
                    isSelected(day)
                      ? 'bg-plum text-latte font-semibold'
                      : isToday(day)
                        ? 'border-plum text-plum hover:bg-latte border-[1.5px] font-semibold'
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
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="text-lilac hover:text-expense border-blush mt-3 w-full border-t py-2 pt-3 text-xs font-semibold transition-colors"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  )
}
