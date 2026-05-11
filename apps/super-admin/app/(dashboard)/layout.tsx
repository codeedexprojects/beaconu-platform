'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuthStore } from '@/store'
import { can, type Permission } from '@/lib/rbac'
import type { AdminRole } from '@/lib/rbac'

// Routes that require a specific permission to access directly
const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/admins': 'admins.view',
  '/settings': 'settings.view',
  '/universities': 'universities.view',
  '/university-types': 'university-types.view',
  '/colleges': 'colleges.view',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, admin } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    // Block direct URL access to routes the role cannot see
    const requiredPermission = Object.entries(ROUTE_PERMISSIONS).find(([route]) =>
      pathname.startsWith(route),
    )?.[1]

    if (requiredPermission && admin?.role && !can(admin.role as AdminRole, requiredPermission)) {
      router.replace('/')
    }
  }, [isAuthenticated, pathname, admin?.role, router])

  if (!isAuthenticated) return <></>

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
