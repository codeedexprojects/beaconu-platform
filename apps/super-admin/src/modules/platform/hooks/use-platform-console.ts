'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { platformService } from '../services/platform.service'
import type {
  CreatePlatformRolePayload,
  PlatformPermission,
  PlatformProfilesResponse,
  PlatformRole,
} from '../types'

interface PlatformConsoleState {
  profiles: PlatformProfilesResponse | null
  roles: PlatformRole[]
  permissions: PlatformPermission[]
  loading: boolean
  error: string | null
  selectedRoleId: string | null
  selectedPermissions: string[]
  createRoleForm: CreatePlatformRolePayload
  setCreateRoleField: (
    field: keyof CreatePlatformRolePayload,
    value: string | string[] | boolean,
  ) => void
  setSelectedRoleId: (roleId: string) => void
  togglePermission: (permission: string) => void
  createRole: () => Promise<void>
  savePermissions: () => Promise<void>
  refresh: () => Promise<void>
}

export function usePlatformConsole(): PlatformConsoleState {
  const [profiles, setProfiles] = useState<PlatformProfilesResponse | null>(null)
  const [roles, setRoles] = useState<PlatformRole[]>([])
  const [permissions, setPermissions] = useState<PlatformPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [createRoleForm, setCreateRoleForm] = useState<CreatePlatformRolePayload>({
    name: '',
    slug: '',
    permissions: [],
    is_system_role: false,
  })

  const syncSelectedRole = useCallback((roleId: string | null, nextRoles: PlatformRole[]) => {
    setSelectedRoleId(roleId)
    const nextRole = nextRoles.find((role) => role.id === roleId) ?? null
    setSelectedPermissions(nextRole?.permissions ?? [])
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profilesData, rolesData, permissionsData] = await Promise.all([
        platformService.getProfiles(),
        platformService.getRoles(),
        platformService.getPermissions(),
      ])
      setProfiles(profilesData)
      setRoles(rolesData)
      setPermissions(permissionsData)

      const nextRoleId = selectedRoleId ?? rolesData[0]?.id ?? null
      syncSelectedRole(nextRoleId, rolesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform data')
    } finally {
      setLoading(false)
    }
  }, [selectedRoleId, syncSelectedRole])

  useEffect(() => {
    let active = true

    async function loadPlatformData() {
      setLoading(true)
      setError(null)
      try {
        const [profilesData, rolesData, permissionsData] = await Promise.all([
          platformService.getProfiles(),
          platformService.getRoles(),
          platformService.getPermissions(),
        ])

        if (!active) return

        setProfiles(profilesData)
        setRoles(rolesData)
        setPermissions(permissionsData)

        const nextRoleId = selectedRoleId ?? rolesData[0]?.id ?? null
        syncSelectedRole(nextRoleId, rolesData)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load platform data')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadPlatformData()

    return () => {
      active = false
    }
  }, [selectedRoleId, syncSelectedRole])

  const togglePermission = useCallback((permission: string) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission].sort(),
    )
  }, [])

  const setCreateRoleField = useCallback(
    (field: keyof CreatePlatformRolePayload, value: string | string[] | boolean) => {
      setCreateRoleForm((current) => ({ ...current, [field]: value }))
    },
    [],
  )

  const createRole = useCallback(async () => {
    if (!createRoleForm.name.trim() || !createRoleForm.slug.trim()) {
      toast.error('Role name and slug are required')
      return
    }

    try {
      const role = await platformService.createRole({
        ...createRoleForm,
        slug: createRoleForm.slug.trim().toLowerCase().replace(/\s+/g, '_'),
      })

      setRoles((current) => [...current, role])
      syncSelectedRole(role.id, [...roles, role])
      setCreateRoleForm({
        name: '',
        slug: '',
        permissions: [],
        is_system_role: false,
      })
      toast.success(`Role ${role.name} created successfully`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create role')
    }
  }, [createRoleForm, roles, syncSelectedRole])

  const savePermissions = useCallback(async () => {
    if (!selectedRoleId) return

    try {
      const updatedRole = await platformService.updateRolePermissions(selectedRoleId, {
        permissions: selectedPermissions,
      })

      setRoles((current) =>
        current.map((role) => (role.id === updatedRole.id ? updatedRole : role)),
      )
      setSelectedPermissions(updatedRole.permissions)
      toast.success(`Permissions updated for ${updatedRole.name}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update permissions')
    }
  }, [selectedPermissions, selectedRoleId])

  return {
    profiles,
    roles,
    permissions,
    loading,
    error,
    selectedRoleId,
    selectedPermissions,
    createRoleForm,
    setCreateRoleField,
    setSelectedRoleId,
    togglePermission,
    createRole,
    savePermissions,
    refresh,
  }
}
