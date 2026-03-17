'use client'

import { useState } from 'react'
import { useCategories, CategoryFormData, Category } from '@/hooks/useCategories'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency } from '@/utils/formatters'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/constants/CategoryOptions'
import ConfirmModal from '@/components/ConfirmModal'
import { Pencil, Trash2, Plus } from 'lucide-react'

const defaultForm: CategoryFormData = {
  name: '',
  type: 'expense',
  icon: '🍔',
  color: '#674188',
}

interface EditState {
  id: string
  form: CategoryFormData
}

export default function CategoriesPage() {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } =
    useCategories()
  const { transactions } = useTransactions()

  const [showAddForm, setShowAddForm] = useState<'expense' | 'income' | null>(null)
  const [newForm, setNewForm] = useState<CategoryFormData>(defaultForm)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  const getCategoryStats = (categoryId: string) => {
    const txs = transactions.filter((t) => t.category_id === categoryId)
    const total = txs.reduce((sum, t) => sum + t.amount, 0)
    return { count: txs.length, total }
  }

  const handleAdd = async (type: 'expense' | 'income') => {
    const success = await addCategory({ ...newForm, type })
    if (success) {
      setNewForm(defaultForm)
      setShowAddForm(null)
    }
  }

  const handleUpdate = async () => {
    if (!editState) return
    const success = await updateCategory(editState.id, editState.form)
    if (success) setEditState(null)
  }

  return (
    <div className="p-4 md:p-8">
      {/* header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-plum text-3xl font-semibold">Categories ✦</h1>
          <p className="text-lilac mt-1 text-base">Organise your income and expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* expense categories */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-plum text-lg font-semibold">💸 Expense</p>
            <button
              onClick={() => {
                setNewForm({ ...defaultForm, type: 'expense' })
                setShowAddForm(showAddForm === 'expense' ? null : 'expense')
              }}
              className="text-plum border-blush hover:bg-latte flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {/* add expense form */}
          {showAddForm === 'expense' && (
            <CategoryForm
              form={newForm}
              onChange={setNewForm}
              onSave={() => handleAdd('expense')}
              onCancel={() => setShowAddForm(null)}
              loading={loading}
              error={error}
            />
          )}

          <div className="flex flex-col gap-2">
            {expenseCategories.length === 0 && !showAddForm && (
              <div className="border-blush rounded-[18px] border bg-white p-6 text-center">
                <p className="text-plum font-semibold">No expense categories</p>
                <p className="text-lilac mt-1 text-sm">Add your first one above</p>
              </div>
            )}
            {expenseCategories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                stats={getCategoryStats(cat.id)}
                editState={editState}
                onEdit={() =>
                  setEditState({
                    id: cat.id,
                    form: { name: cat.name, type: cat.type, icon: cat.icon, color: cat.color },
                  })
                }
                onEditChange={(form) => setEditState((prev) => (prev ? { ...prev, form } : null))}
                onSaveEdit={handleUpdate}
                onCancelEdit={() => setEditState(null)}
                onDelete={() => setConfirmDelete(cat.id)}
                loading={loading}
              />
            ))}
          </div>
        </div>

        {/* income categories */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-plum text-lg font-semibold">💰 Income</p>
            <button
              onClick={() => {
                setNewForm({ ...defaultForm, type: 'income' })
                setShowAddForm(showAddForm === 'income' ? null : 'income')
              }}
              className="text-plum border-blush hover:bg-latte flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {/* add income form */}
          {showAddForm === 'income' && (
            <CategoryForm
              form={newForm}
              onChange={setNewForm}
              onSave={() => handleAdd('income')}
              onCancel={() => setShowAddForm(null)}
              loading={loading}
              error={error}
            />
          )}

          <div className="flex flex-col gap-2">
            {incomeCategories.length === 0 && !showAddForm && (
              <div className="border-blush rounded-[18px] border bg-white p-6 text-center">
                <p className="text-plum font-semibold">No income categories</p>
                <p className="text-lilac mt-1 text-sm">Add your first one above</p>
              </div>
            )}
            {incomeCategories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                stats={getCategoryStats(cat.id)}
                editState={editState}
                onEdit={() =>
                  setEditState({
                    id: cat.id,
                    form: { name: cat.name, type: cat.type, icon: cat.icon, color: cat.color },
                  })
                }
                onEditChange={(form) => setEditState((prev) => (prev ? { ...prev, form } : null))}
                onSaveEdit={handleUpdate}
                onCancelEdit={() => setEditState(null)}
                onDelete={() => setConfirmDelete(cat.id)}
                loading={loading}
              />
            ))}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete Category"
          message="Are you sure you want to delete this category? Transactions using it will lose their category."
          confirmLabel="Delete Category"
          onConfirm={() => {
            deleteCategory(confirmDelete)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

// ── Category Form (inline) ──
interface CategoryFormProps {
  form: CategoryFormData
  onChange: (form: CategoryFormData) => void
  onSave: () => void
  onCancel: () => void
  loading: boolean
  error: string
}

function CategoryForm({ form, onChange, onSave, onCancel, loading, error }: CategoryFormProps) {
  return (
    <div className="border-blush mb-3 flex flex-col gap-3 rounded-[18px] border bg-white p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="Category name"
          className="border-blush bg-latte text-plum focus:border-lilac flex-1 rounded-xl border-[1.5px] px-4 py-2.5 text-sm transition-colors outline-none"
        />
      </div>

      {/* icons */}
      <div>
        <label className="text-plum mb-1.5 block text-xs font-semibold">Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onChange({ ...form, icon })}
              className={`h-9 w-9 rounded-[10px] border-[1.5px] text-lg transition-all ${form.icon === icon ? 'border-plum bg-plum-100' : 'border-blush bg-latte hover:border-lilac'}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* colors */}
      <div>
        <label className="text-plum mb-1.5 block text-xs font-semibold">Color</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...form, color })}
              className={`h-7 w-7 rounded-full border-2 transition-all ${form.color === color ? 'border-plum scale-110' : 'border-transparent'}`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-expense text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="border-blush text-plum hover:bg-latte flex-1 rounded-full border-[1.5px] py-2 text-sm font-bold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={loading || !form.name}
          className="bg-plum text-latte hover:bg-plum-700 flex-1 rounded-full py-2 text-sm font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save ✦'}
        </button>
      </div>
    </div>
  )
}

// ── Category Row ──
interface CategoryRowProps {
  category: Category
  stats: { count: number; total: number }
  editState: EditState | null
  onEdit: () => void
  onEditChange: (form: CategoryFormData) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  loading: boolean
}

function CategoryRow({
  category,
  stats,
  editState,
  onEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  loading,
}: CategoryRowProps) {
  const isEditing = editState?.id === category.id

  if (isEditing && editState) {
    return (
      <CategoryForm
        form={editState.form}
        onChange={onEditChange}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
        loading={loading}
        error=""
      />
    )
  }

  return (
    <div className="border-blush flex items-center gap-3 rounded-[18px] border bg-white p-4">
      {/* icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: `${category.color}22` }}
      >
        {category.icon}
      </div>

      {/* name + stats */}
      <div className="min-w-0 flex-1">
        <p className="text-plum text-sm font-semibold">{category.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-lilac text-xs">
            {stats.count} transaction{stats.count !== 1 ? 's' : ''}
          </span>
          <span className="text-blush text-xs">·</span>
          <span className="text-lilac text-xs">{formatCurrency(stats.total)}</span>
        </div>
      </div>

      {/* color dot */}
      <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: category.color }} />

      {/* actions */}
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="text-lilac hover:text-plum transition-colors">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="text-blush hover:text-expense transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
