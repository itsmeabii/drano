'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { navItems } from '@/constants/NavItems'

interface Profile {
  first_name: string | null
  last_name: string | null
  username: string | null
  avatar_url: string | null
}

interface SideBarProps {
  profile?: Profile | null
}

export default function SideBar({ profile }: SideBarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : (profile?.username ?? 'My Account')

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '✦'

  return (
    <aside className="bg-plum relative flex min-h-screen w-[220px] flex-shrink-0 flex-col overflow-hidden">
      {/* decorative blobs */}
      <div className="bg-plum-500 pointer-events-none absolute top-[-60px] right-[-60px] h-[160px] w-[160px] rounded-full opacity-40" />
      <div className="bg-plum-800 pointer-events-none absolute bottom-[80px] left-[-40px] h-[120px] w-[120px] rounded-full opacity-30" />

      {/* logo */}
      <div className="border-plum-700 relative z-10 border-b px-5 pt-7 pb-5">
        <p className="font-display text-latte text-2xl font-semibold tracking-tight">✦ drano</p>
        <p className="font-display text-latte mt-0.5 text-xs italic">
          drain the debt. manifest the wealth.
        </p>
      </div>

      {/* nav */}
      <nav className="relative z-10 flex-1 py-2">
        {navItems.map((group) => (
          <div key={group.section} className="px-3 pt-4 pb-1">
            <p className="text-plum-300 mb-1.5 px-2 text-[11px] tracking-[1.5px] uppercase">
              {group.section}
            </p>
            {group.links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] transition-all ${
                    isActive
                      ? 'bg-plum-700 text-latte font-semibold'
                      : 'text-blush hover:bg-plum-800 hover:text-latte'
                  }`}
                >
                  <span className="w-5 text-center text-[15px]">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* user + logout */}
      <div className="border-plum-700 relative z-10 border-t px-3 pt-4 pb-5">
        <div className="bg-plum-700 mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5">
          <div className="bg-lilac text-plum flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {initials}
          </div>
          <div>
            <p className="text-latte text-xs font-semibold">{displayName}</p>
            <p className="text-plum-400 text-[10px]">my financial universe</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-plum-400 hover:text-latte hover:bg-plum-800 w-full rounded-xl px-3 py-2 text-left text-[12px] transition-all"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
