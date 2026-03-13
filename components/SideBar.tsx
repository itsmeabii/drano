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
    : profile?.username ?? 'My Account'

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '✦'

  return (
    <aside className="w-[220px] min-h-screen bg-plum flex flex-col flex-shrink-0 relative overflow-hidden">

      {/* decorative blobs */}
      <div className="absolute top-[-60px] right-[-60px] w-[160px] h-[160px] rounded-full bg-plum-500 opacity-40 pointer-events-none" />
      <div className="absolute bottom-[80px] left-[-40px] w-[120px] h-[120px] rounded-full bg-plum-800 opacity-30 pointer-events-none" />

      {/* logo */}
      <div className="px-5 pt-7 pb-5 border-b border-plum-700 relative z-10">
        <p className="font-display text-2xl font-semibold text-latte tracking-tight">✦ drano</p>
        <p className="font-display italic text-xs text-latte mt-0.5">drain the debt. manifest the wealth.</p>
      </div>

      {/* nav */}
      <nav className="flex-1 relative z-10 py-2">
        {navItems.map((group) => (
          <div key={group.section} className="px-3 pt-4 pb-1">
            <p className="text-[11px] uppercase tracking-[1.5px] text-plum-300 px-2 mb-1.5">
              {group.section}
            </p>
            {group.links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[14px] mb-0.5 transition-all
                    ${isActive
                      ? 'bg-plum-700 text-latte font-semibold'
                      : 'text-blush hover:bg-plum-800 hover:text-latte'
                    }`}
                >
                  <span className="text-[15px] w-5 text-center">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* user + logout */}
      <div className="px-3 pb-5 relative z-10 border-t border-plum-700 pt-4">
        <div className="bg-plum-700 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-lilac flex items-center justify-center text-plum text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-latte text-xs font-semibold">{displayName}</p>
            <p className="text-plum-400 text-[10px]">my financial universe</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-[12px] text-plum-400 hover:text-latte hover:bg-plum-800 rounded-xl transition-all"
        >
          Sign Out
        </button>
      </div>

    </aside>
  )
}