'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlayCircle, Users, Award } from 'lucide-react'

const DOC_TABS = [
  { href: '/dashboard',             label: 'Inicio',      Icon: Home       },
  { href: '/dashboard/cursos',      label: 'Mis Cursos',  Icon: PlayCircle },
  { href: '/dashboard/comunidad',   label: 'Comunidad',   Icon: Users      },
  { href: '/dashboard/certificados',label: 'Certificados',Icon: Award      },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Glassmorphism bar */}
      <div
        className="w-full flex items-center justify-around px-2 pt-2 pb-3 mx-3 mb-3 rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {DOC_TABS.map(({ href, label, Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all active:scale-95 min-w-[60px]"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-primary' : 'text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[10px] font-black tracking-tight transition-colors leading-none ${
                  isActive ? 'text-primary' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary opacity-0" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
