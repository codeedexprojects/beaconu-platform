'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminsService } from '../services/admins.service'
import type { AdminListItem } from '../types'

export function useAdmins(search: string) {
  const [admins, setAdmins] = useState<AdminListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAdmins = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await adminsService.list()
      setAdmins(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admins')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAdmins()
  }, [loadAdmins])

  const create = useCallback(async (data: any) => {
    try {
      const newAdmin = await adminsService.create(data)
      setAdmins((prev) => [newAdmin, ...prev])
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create admin',
      }
    }
  }, [])

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return admins

    return admins.filter((admin) => {
      const haystack = [
        admin.fullName,
        admin.email,
        admin.role?.name,
        admin.role?.slug,
        admin.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [admins, search])

  return {
    admins: filteredAdmins,
    totalAdmins: admins.length,
    loading,
    error,
    create,
    refresh: loadAdmins,
  }
}