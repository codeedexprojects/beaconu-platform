'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { associateAdminsService } from '../services/associate-admins.service'
import type { AssociateAdminItem } from '../types'

export function useAssociateAdmins(search: string) {
  const [items, setItems] = useState<AssociateAdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await associateAdminsService.list()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch associate admins')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const updateStatus = useCallback(async (associateAdminId: string, status: string) => {
    setApprovingId(associateAdminId)
    try {
      const result = await associateAdminsService.updateStatus(associateAdminId, status)
      setItems((previous) =>
        previous.map((item) =>
          item.id === associateAdminId
            ? { ...item, status: result.status }
            : item,
        ),
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update associate admin status')
      return false
    } finally {
      setApprovingId(null)
    }
  }, [])

  const approve = useCallback((id: string) => updateStatus(id, 'active'), [updateStatus])
  const reject = useCallback((id: string) => updateStatus(id, 'rejected'), [updateStatus])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items

    return items.filter((item) => {
      const haystack = [
        item.fullName,
        item.email,
        item.status,
        item.agencyName,
        item.agencyRegNumber,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [items, search])

  return {
    associateAdmins: filteredItems,
    totalAssociateAdmins: items.length,
    loading,
    error,
    approvingId,
    approve,
    reject,
    refresh: load,
  }
}