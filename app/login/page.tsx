'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import SplashScreen from '@/components/SplashScreen'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  if (loading) return <SplashScreen />

  return (
    <div className="bg-latte relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* blobs */}
      <div className="bg-blush fixed top-[-80px] left-[-80px] z-0 h-[300px] w-[300px] rounded-full opacity-40" />
      <div className="bg-lilac fixed right-[-60px] bottom-[-60px] z-0 h-[250px] w-[250px] rounded-full opacity-30" />

      <div className="border-blush relative z-10 w-full max-w-[400px] rounded-[24px] border bg-white p-10">
        {/* logo */}
        <div className="mb-7 text-center">
          <p className="font-display text-plum text-3xl font-semibold tracking-tight">✦ drano</p>
          <p className="font-display text-lilac-600 mt-1 text-base italic">
            drain the debt. manifest the wealth.
          </p>
        </div>

        <p className="font-display text-plum mb-5 text-xl font-semibold">welcome back</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-plum mb-1 block text-xs font-semibold">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="border-blush bg-latte text-plum font-body focus:border-lilac w-full rounded-[12px] border-[1.5px] px-4 py-2.5 text-sm transition-colors outline-none"
            />
          </div>

          <div>
            <label className="text-plum mb-1 block text-xs font-semibold">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="border-blush bg-latte text-plum font-body focus:border-lilac w-full rounded-[12px] border-[1.5px] px-4 py-2.5 text-sm transition-colors outline-none"
            />
          </div>

          {error && (
            <div className="border-blush text-expense rounded-[10px] border bg-[#fdf0f5] px-4 py-2.5 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="bg-plum text-latte font-body hover:bg-plum-700 w-full rounded-full py-3 text-sm font-bold transition-colors"
          >
            log in
          </button>
        </form>

        <p className="text-lilac mt-5 text-center text-xs">
          no account yet?{' '}
          <Link href="/signup" className="text-plum font-bold">
            sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
