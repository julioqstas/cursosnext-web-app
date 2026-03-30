import React from 'react'
import Link from 'next/link'

export default function ComingSoonModule({ title, description, iconPath }: { title: string, description: string, iconPath: string }) {
  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-4xl p-10 ring-1 ring-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden group">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-primary/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
        
        {/* Icon Container with pulse animation */}
        <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 ring-4 ring-white shadow-xl shadow-slate-200/50 relative">
          <div className="absolute inset-0 bg-primary/10 rounded-[2rem] animate-[ping_3s_ease-in-out_infinite] opacity-50"></div>
          <svg className="w-10 h-10 text-primary relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>

        <span className="bg-primary/10 text-primary text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 inline-block ring-1 ring-primary/20">
          En Desarrollo
        </span>

        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h2>
        <p className="text-slate-500 font-medium leading-relaxed mb-8">{description}</p>

        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 active:scale-95">
          <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}
