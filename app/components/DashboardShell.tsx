'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import MobileDock from '@/app/components/MobileDock'
import { User, LogOut, BellOff } from 'lucide-react'

interface DashboardShellProps {
  children: React.ReactNode
  userInitial: string
  userName: string
  userRole: string
}

export default function DashboardShell({ children, userInitial, userName, userRole }: DashboardShellProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifMenuOpen, setNotifMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false)
    setNotifMenuOpen(false)
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

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-72 bg-white/60 backdrop-blur-xl border-r border-slate-200/60 z-50 flex-col shrink-0">
        {/* Desktop Sidebar Logo Header */}
        <div className="h-20 flex items-center px-8 shrink-0">
          <Link href="/dashboard" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://isimova.com/assets/img/Isimova-Color-Horizontal.png" 
              alt="ISIMOVA Academy Logo" 
              className="h-10 w-auto brightness-90 contrast-125"
            />
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-black tracking-tight text-[15px] ${isActive ? 'bg-primary/20 text-isimova-blue shadow-[inset_0_0_20px_rgba(242,140,56,0.05)]' : 'text-slate-500 hover:bg-slate-50 hover:text-isimova-blue'}`}>
                <svg className="w-[22px] h-[22px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2}>
                  {getIcon(link.icon)}
                </svg>
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        {/* User Mini Profile — Desktop sidebar bottom (simplified, no logout) */}
        <div className="px-5 pb-8 mt-auto flex flex-col gap-2 shrink-0">
          <Link href="/dashboard/perfil" className={`flex items-center gap-4 w-full p-4 rounded-[1.25rem] transition-all text-left group border ${pathname === '/dashboard/perfil' ? 'bg-primary/20 border-transparent shadow-[inset_0_0_20px_rgba(242,140,56,0.05)]' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'}`}>
            <div className={`w-11 h-11 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center font-black text-xl ring-2 transition-all shadow-sm ${pathname === '/dashboard/perfil' ? 'bg-primary text-white ring-primary/30' : 'bg-primary/10 text-primary ring-transparent group-hover:ring-primary/20'}`}>
               {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-black tracking-tight text-isimova-blue truncate pr-2">{userName}</p>
              <p className={`text-[12px] font-bold uppercase tracking-wider truncate ${pathname === '/dashboard/perfil' ? 'text-isimova-blue/80' : 'text-slate-500'}`}>{userRole}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 flex flex-col h-full relative z-10 min-w-0">
        
        {/* ── Topbar ── */}
        <header className="h-[68px] shrink-0 flex items-center justify-between px-5 sm:px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 w-full gap-4">
          
          {/* LEFT: Mobile Logo | Desktop Search */}
          <div className="flex items-center flex-1 min-w-0 gap-4">
            {/* Mobile Logo (left-anchored) */}
            <Link href="/dashboard" className="lg:hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://isimova.com/assets/img/Isimova-Color-Horizontal.png" 
                alt="ISIMOVA Academy Logo" 
                className="h-8 w-auto brightness-90 contrast-125 drop-shadow-sm"
              />
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-xl items-center bg-white border border-slate-200/80 rounded-full px-5 py-2.5 shadow-sm focus-within:ring-2 ring-primary/20 transition-all focus-within:border-primary/30">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" placeholder="Explora tu próximo curso, diploma o recursos..." className="bg-transparent border-none outline-none w-full ml-3 text-[14px] font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" />
            </div>
          </div>

          {/* RIGHT: Notifications + User Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* ── Notifications dropdown ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifMenuOpen(prev => !prev); setUserMenuOpen(false) }}
                className="relative p-2.5 text-slate-500 hover:text-isimova-blue hover:bg-slate-100 bg-slate-50 rounded-xl transition-colors ring-1 ring-slate-200/60 shadow-sm active:scale-95"
              >
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              </button>

              {/* Notifications Dropdown */}
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-2xl overflow-hidden z-50 transition-all duration-200"
                style={{
                  opacity: notifMenuOpen ? 1 : 0,
                  transform: notifMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
                  pointerEvents: notifMenuOpen ? 'auto' : 'none',
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(226,232,240,0.8)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
                }}
              >
                <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-isimova-blue font-black text-[14px]">Notificaciones</p>
                  <span className="bg-slate-100 text-slate-500 font-black text-[11px] px-2 py-0.5 rounded-full">0</span>
                </div>
                <div className="flex flex-col items-center justify-center py-8 px-4 gap-3">
                  <BellOff className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                  <p className="text-slate-400 text-sm font-bold text-center">No hay notificaciones nuevas</p>
                </div>
              </div>
            </div>

            {/* ── User Avatar + Dropdown (All screen sizes) ── */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => { setUserMenuOpen(prev => !prev); setNotifMenuOpen(false) }}
                className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg ring-2 ring-primary/20 transition-all active:scale-95 shadow-sm hover:bg-primary/20"
              >
                {userInitial}
              </button>

              {/* Dropdown Menu */}
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-52 rounded-2xl overflow-hidden z-50 transition-all duration-200"
                style={{
                  opacity: userMenuOpen ? 1 : 0,
                  transform: userMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
                  pointerEvents: userMenuOpen ? 'auto' : 'none',
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(226,232,240,0.8)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
                }}
              >
                {/* User info */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                  <p className="text-isimova-blue font-black text-[14px] truncate">{userName}</p>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wide">{userRole}</p>
                </div>
                {/* Options */}
                <div className="p-1.5 flex flex-col gap-0.5">
                  <Link
                    href="/dashboard/perfil"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-primary/5 hover:text-isimova-blue transition-colors font-bold text-sm"
                  >
                    <User className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    Tu Perfil
                  </Link>
                  <form action={logoutAction}>
                    <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-sm">
                      <LogOut className="w-4 h-4 text-red-400" strokeWidth={2.5} />
                      Cerrar Sesión
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Scrollable Area — extra pb on mobile for dock */}
        <div className="flex-1 overflow-y-auto w-full relative pb-[90px] lg:pb-0">
          {children}
        </div>

        {/* ── Mobile Navigation Dock ── */}
        <MobileDock />

      </main>

    </div>
  )
}
