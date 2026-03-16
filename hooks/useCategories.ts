'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export interface Category {
  id: string
  name: string
  type: 'expense' | 'income'
  icon: string
  color: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    createClient()
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  return categories
}