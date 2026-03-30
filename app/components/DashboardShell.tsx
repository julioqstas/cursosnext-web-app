'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'

interface DashboardShellProps {
  children: React.ReactNode
  userInitial: string
  userName: string
  userRole: string
}

export default function DashboardShell({ children, userInitial, userName, userRole }: DashboardShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (in mobile)
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/dashboard', icon: 'home', label: 'Dashboard' },
    { href: '/dashboard/cursos', icon: 'play', label: 'Mis Cursos' },
    { href: '/dashboard/comunidad', icon: 'users', label: 'Comunidad' },
    { href: '/dashboard/certificados', icon: 'award', label: 'Certificados' },
  ]

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'home': return <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth={2.5}/>
      case 'play': return <><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeWidth={2.5}/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2.5}/></>
      case 'users': return <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth={2.5}/><circle cx="9" cy="7" r="4" strokeWidth={2.5}/><path d="M23 21v-2a4 4 0 00-3-3.87" strokeWidth={2.5}/><path d="M16 3.13a4 4 0 010 7.75" strokeWidth={2.5}/></>
      case 'award': return <><circle cx="12" cy="8" r="7" strokeWidth={2.5}/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" strokeWidth={2.5}/></>
      default: return null
    }
  }

  return (
    <div className="flex h-dvh bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* ── Mobile Overlay ── */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      {/* ── Sidebar (Desktop & Mobile Offcanvas) ── */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white lg:bg-white/60 lg:backdrop-blur-xl border-r border-slate-200/60 z-50 flex flex-col transform transition-transform duration-300 shrink-0 lg:relative lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Desktop Sidebar Logo Header */}
        <div className="h-20 flex items-center px-8 shrink-0">
          <Link href="/dashboard" className="flex items-center">
            {/* Logo Oficial ISIMOVA */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://isimova.com/assets/img/Isimova-Color-Horizontal.png" 
              alt="ISIMOVA Academy Logo" 
              className="h-[30px] w-auto brightness-90 contrast-125"
            />
          </Link>
          
          {/* Mobile close button inside the sidebar just in case */}
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-slate-900">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-black tracking-tight text-[15px] ${isActive ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(249,115,22,0.02)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-[22px] h-[22px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2}>
                  {getIcon(link.icon)}
                </svg>
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        {/* User Mini Profile & Settings */}
        <div className="px-5 pb-8 mt-auto flex flex-col gap-2 shrink-0">
          <Link href="/dashboard/perfil" className="flex items-center gap-4 w-full p-4 rounded-[1.25rem] hover:bg-slate-50 transition-colors text-left group border border-transparent hover:border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-slate-500 font-black text-xl ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm">
               {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-black tracking-tight text-slate-900 truncate pr-2">{userName}</p>
              <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider truncate">{userRole}</p>
            </div>
          </Link>

          <form action={logoutAction} className="w-full">
            <button type="submit" className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-[1.25rem] text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent font-black tracking-wide text-[14px] transition-colors group relative overflow-hidden">
               <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-red-500 transition-colors relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               <span className="relative z-10">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 flex flex-col h-full relative z-10 min-w-0">
        
        {/* Topbar flotante */}
        <header className="h-[76px] shrink-0 flex items-center justify-between px-5 sm:px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 w-full">
          
          {/* Mobile menu (Hamburger) */}
          <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 bg-slate-100/50 hover:bg-slate-100 rounded-xl transition-colors active:scale-95 shrink-0 relative z-20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          
          {/* Centered Mobile Logo (Only visible on small screens!) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden z-10 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://isimova.com/assets/img/Isimova-Color-Horizontal.png" 
              alt="ISIMOVA Academy Logo" 
              className="h-7 w-auto block brightness-90 contrast-125 drop-shadow-sm"
            />
          </div>

          {/* Search Bar (Desktop only) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-auto items-center bg-white border border-slate-200/80 rounded-full px-5 py-2.5 shadow-sm shadow-slate-200/20 focus-within:ring-2 ring-primary/20 transition-all focus-within:border-primary/30">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Explora tu próximo curso, diploma o recursos..." className="bg-transparent border-none outline-none w-full ml-3 text-[14px] font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" />
          </div>

          <div className="flex items-center gap-4 ml-auto lg:ml-0 relative z-20 shrink-0">
            {/* Desktop only user name in header (optional, keep it clean) */}
            
            {/* Notifications */}
            <button className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 rounded-xl transition-colors ring-1 ring-slate-200/60 shadow-sm active:scale-95">
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-[3px] ring-white shadow-sm"></span>
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto w-full relative">
          {children}
        </div>
      </main>

    </div>
  )
}
