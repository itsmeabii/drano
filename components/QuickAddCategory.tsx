import { CATEGORY_ICONS } from '@/constants/CategoryOptions'
import { Category, CategoryFormData, useCategories } from '@/hooks/useCategories'
import { useState } from 'react'

interface QuickAddCategoryProps {
  type: 'expense' | 'income'
  onSuccess: (cat: Category) => void
  onCancel: () => void
}

export function QuickAddCategory({ type, onSuccess, onCancel }: QuickAddCategoryProps) {
  const [form, setForm] = useState<CategoryFormData>({
    name: '',
    type,
    icon: '🍔',
    color: '#674188',
  })
  const { addCategory, loading, error, categories } = useCategories()

  const handleSave = async () => {
    const success = await addCategory(form)
    if (success) {
      // find the newly added category
      const newCat = categories.find((c) => c.name === form.name && c.type === type)
      if (newCat) onSuccess(newCat)
    }
  }

  return (
    <div className="bg-latte border-blush mb-3 flex flex-col gap-2 rounded-[12px] border p-3">
      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Category name"
        className="border-blush text-plum focus:border-lilac w-full rounded-[10px] border-[1.5px] bg-white px-3 py-2 text-sm transition-colors outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_ICONS.slice(0, 16).map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => setForm({ ...form, icon })}
            className={`h-8 w-8 rounded-[8px] border-[1.5px] text-base transition-all ${form.icon === icon ? 'border-plum bg-white' : 'hover:border-blush border-transparent'}`}
          >
            {icon}
          </button>
        ))}
      </div>
      {error && <p className="text-expense text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="border-blush text-plum flex-1 rounded-full border py-1.5 text-xs font-bold transition-colors hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !form.name}
          className="bg-plum text-latte hover:bg-plum-700 flex-1 rounded-full py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add ✦'}
        </button>
      </div>
    </div>
  )
}
