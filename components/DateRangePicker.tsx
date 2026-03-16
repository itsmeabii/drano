'use client'

import DatePicker from '@/components/DatePicker'

interface Props {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  label?: string
  fromLabel?: string
  toLabel?: string
}

export default function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  label = 'Date Range',
  fromLabel = 'From',
  toLabel = 'To',
}: Props) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-plum mb-1.5">{label}</label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <DatePicker
          label={fromLabel}
          value={from}
          onChange={onFromChange}
        />
        <DatePicker
          label={toLabel}
          value={to}
          onChange={onToChange}
        />
      </div>
    </div>
  )
}