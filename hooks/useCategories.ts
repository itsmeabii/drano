'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface Category {
  id: string
  name: string
  type: 'expense' | 'income'
  icon: string
  color: string
}

export interface CategoryFormData {
  name: string
  type: 'expense' | 'income'
  icon: string
  color: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    setCategories(data ?? [])
  }

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
      setCategories(data ?? [])
    }
    load()
  }, [])

  const addCategory = async (form: CategoryFormData) => {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('categories').insert({
      ...form,
      user_id: user.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    await fetchCategories()
    router.refresh()
    setLoading(false)
    return true
  }

  const updateCategory = async (id: string, form: Partial<CategoryFormData>) => {
    setLoading(true)
    setError('')

    const { error } = await supabase.from('categories').update(form).eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    await fetchCategories()
    router.refresh()
    setLoading(false)
    return true
  }

  const deleteCategory = async (id: string) => {
    setLoading(true)
    setError('')

    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    await fetchCategories()
    router.refresh()
    setLoading(false)
    return true
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
