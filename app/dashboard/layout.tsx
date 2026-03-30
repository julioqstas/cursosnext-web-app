import React from 'react'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/app/components/DashboardShell'

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
  const userRole = profile?.role === 'admin' ? 'Administrador' : 'Estudiante PRO'

  return (
    <DashboardShell 
      userInitial={userInitial}
      userName={userName}
      userRole={userRole}
    >
      {children}
    </DashboardShell>
  )
}
