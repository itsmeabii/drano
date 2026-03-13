'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import SplashScreen from '@/components/SplashScreen'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signup, loading, error } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    await signup(email, password)
  }

  if (loading) return <SplashScreen />

  return (
    <div className="min-h-screen bg-latte flex items-center justify-center p-4 relative overflow-hidden">

      {/* blobs */}
      <div className="fixed top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-blush opacity-40 z-0" />
      <div className="fixed bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-lilac opacity-30 z-0" />

      <div className="bg-white border border-blush rounded-[24px] p-10 w-full max-w-[400px] relative z-10">

        {/* logo */}
        <div className="text-center mb-7">
          <p className="font-display text-3xl font-semibold text-plum tracking-tight">✦ drano</p>
          <p className="font-display italic text-xs text-lilac mt-1">drain the debt. manifest the wealth.</p>
        </div>

        <p className="font-display text-xl font-semibold text-plum mb-5">start your journey ✦</p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">

          <div>
            <label className="block text-xs font-semibold text-plum mb-1">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-[12px] border-[1.5px] border-blush bg-latte text-sm text-plum font-body outline-none focus:border-lilac transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum mb-1">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-[12px] border-[1.5px] border-blush bg-latte text-sm text-plum font-body outline-none focus:border-lilac transition-colors"
            />
          </div>

          {error && (
            <div className="bg-[#fdf0f5] border border-blush rounded-[10px] px-4 py-2.5 text-xs text-expense">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-plum text-latte rounded-full py-3 text-sm font-bold font-body hover:bg-plum-700 transition-colors"
          >
            create account ✦
          </button>

        </form>

        <p className="text-center text-xs text-lilac mt-5">
          already have an account?{' '}
          <Link href="/login" className="text-plum font-bold">log in</Link>
        </p>

      </div>
    </div>
  )
}