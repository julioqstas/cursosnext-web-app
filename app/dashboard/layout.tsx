import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/actions/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
     const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
     profile = p
  }

  const userInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'
  const userName = profile?.full_name ?? 'Usuario'
  const userRole = profile?.role === 'admin' ? 'Administrador' : 'Estudiante'

  return (
    <div className="flex h-dvh bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* ── Sidebar (Glassmorphism Premium) ── */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-slate-200/60 bg-white/60 backdrop-blur-xl z-20">
        <div className="h-20 flex items-center px-8 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary-variant flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl leading-none tracking-tighter">I</span>
            </div>
            <span className="text-slate-900 font-bold text-[19px] tracking-tight whitespace-nowrap">ISIMOVA Academy</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <NavItem href="/dashboard" icon="home" label="Dashboard" />
          <NavItem href="/dashboard/cursos" icon="play" label="Mis Cursos" />
          <NavItem href="/dashboard/comunidad" icon="users" label="Comunidad" />
          <NavItem href="/dashboard/certificados" icon="award" label="Certificados" />
        </nav>
        
        {/* User Mini Profile & Settings */}
        <div className="px-4 pb-6 mt-auto flex flex-col gap-2">
          <Link href="/dashboard/perfil" className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-slate-100 transition-colors text-left group">
            <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-lg ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
               {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500 font-medium truncate">{userRole}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </Link>

          <form action={logoutAction} className="w-full">
            <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold text-[15px] transition-colors group">
               <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Topbar flotante */}
        <header className="h-20 shrink-0 flex items-center justify-between px-8 bg-white/40 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-10 w-full">
          {/* Mobile menu button */}
          <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          
          {/* Search Bar central */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto items-center bg-white/80 border border-slate-200/60 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 ring-primary/20 transition-all">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Buscar cursos o herramientas metodológicas..." className="bg-transparent border-none outline-none w-full ml-3 text-sm text-slate-700 placeholder:text-slate-400" />
          </div>

          <div className="flex items-center gap-4 ml-auto lg:ml-0">
            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  const getIcon = () => {
    switch(icon) {
      case 'home': return <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth={2.5}/>
      case 'play': return <><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeWidth={2.5}/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2.5}/></>
      case 'users': return <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth={2.5}/><circle cx="9" cy="7" r="4" strokeWidth={2.5}/><path d="M23 21v-2a4 4 0 00-3-3.87" strokeWidth={2.5}/><path d="M16 3.13a4 4 0 010 7.75" strokeWidth={2.5}/></>
      case 'award': return <><circle cx="12" cy="8" r="7" strokeWidth={2.5}/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" strokeWidth={2.5}/></>
      default: return null
    }
  }

  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-[15px] ${active ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
        {getIcon()}
      </svg>
      {label}
    </Link>
  )
}
