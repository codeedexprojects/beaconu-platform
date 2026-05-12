'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { apiAction } from '@/lib/api'
import {
  createPlatformRole,
  getPlatformPermissions,
  getPlatformRoles,
  updatePlatformRolePermissions,
  type PlatformRole,
} from '@/lib/services/roles.service'

type FormState = {
  name: string
  slug: string
  permissions: string[]
}

const initialFormState: FormState = {
  name: '',
  slug: '',
  permissions: [],
}

function toRoleSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

interface PermissionsSelectProps {
  availablePermissions: string[]
  selectedPermissions: string[]
  onChange: (permissions: string[]) => void
  placeholder?: string
}

function PermissionsSelect({
  availablePermissions,
  selectedPermissions,
  onChange,
  placeholder = 'Select permissions...',
}: PermissionsSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const togglePermission = (permission: string) => {
    const updated = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((p) => p !== permission)
      : [...selectedPermissions, permission]
    onChange(updated)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex flex-1 flex-wrap gap-1">
          {selectedPermissions.length > 0 ? (
            selectedPermissions.map((perm) => (
              <Badge key={perm} variant="secondary" className="text-xs">
                {perm}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <svg
          className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-input rounded-md bg-popover shadow-md">
          <div className="max-h-64 overflow-y-auto p-2">
            {availablePermissions.length > 0 ? (
              availablePermissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="h-4 w-4 rounded border-input cursor-pointer"
                  />
                  <span className="text-sm flex-1">{permission}</span>
                </label>
              ))
            ) : (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">No permissions available</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RolesPage() {
  const [roles, setRoles] = useState<PlatformRole[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createForm, setCreateForm] = useState<FormState>(initialFormState)
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [editingPermissions, setEditingPermissions] = useState<string[]>([])

  useEffect(() => {
    void fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        getPlatformRoles(),
        getPlatformPermissions(),
      ])
      setRoles(rolesResponse)
      setAvailablePermissions(permissionsResponse)
    } catch (error) {
      console.error('Failed to fetch roles data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const roleCountLabel = useMemo(() => {
    if (isLoading) return 'Loading...'
    return `${roles.length} roles`
  }, [isLoading, roles.length])

  async function handleCreateRole() {
    const name = createForm.name.trim()
    const slug = toRoleSlug(createForm.slug)

    if (!name) {
      toast.error('Role name is required')
      return
    }

    if (!slug) {
      toast.error('Role slug is required')
      return
    }

    if (!/^[a-z0-9_]+$/.test(slug)) {
      toast.error('Role slug can only contain lowercase letters, numbers, and underscores')
      return
    }

    const payload = {
      name,
      slug,
      permissions: createForm.permissions,
      is_system_role: false,
    }

    const result = await apiAction(
      () => createPlatformRole(payload),
      'Role created successfully',
    )

    if (!result) return

    setCreateForm(initialFormState)
    setIsSlugEdited(false)
    await fetchData()
  }

  function handleStartEdit(role: PlatformRole) {
    setEditingRoleId(role.id)
    setEditingPermissions(role.permissions)
  }

  async function handleSavePermissions(roleId: string) {
    const payload = { permissions: editingPermissions }

    const result = await apiAction(
      () => updatePlatformRolePermissions(roleId, payload),
      'Role permissions updated',
    )

    if (!result) return

    setEditingRoleId(null)
    setEditingPermissions([])
    await fetchData()
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header
        title="Roles"
        description="Create platform roles and update their permissions using admin APIs"
      />

      <div className="flex-1 space-y-4 p-6">
        <div className="flex justify-end">
          <Badge variant="outline" className="px-3 py-1">
            {roleCountLabel}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Role Name</label>
                <input
                  type="text"
                  placeholder="Role name"
                  value={createForm.name}
                  onChange={(e) => {
                    const nextName = e.target.value
                    setCreateForm((prev) => ({
                      ...prev,
                      name: nextName,
                      slug: isSlugEdited ? prev.slug : toRoleSlug(nextName),
                    }))
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Role Slug</label>
                <input
                  type="text"
                  placeholder="Role slug"
                  value={createForm.slug}
                  onChange={(e) => {
                    setIsSlugEdited(true)
                    setCreateForm((prev) => ({ ...prev, slug: toRoleSlug(e.target.value) }))
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Permissions</label>
              <PermissionsSelect
                availablePermissions={availablePermissions}
                selectedPermissions={createForm.permissions}
                onChange={(permissions) =>
                  setCreateForm((prev) => ({ ...prev, permissions }))
                }
                placeholder="Select permissions..."
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateRole} disabled={isLoading}>
                Create Role
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-[160px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-8 w-[110px]" /></TableCell>
                    </TableRow>
                  ))
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => {
                    const isEditing = editingRoleId === role.id
                    return (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.slug}</TableCell>
                        <TableCell>
                          <Badge variant={role.isSystemRole ? 'secondary' : 'outline'}>
                            {role.isSystemRole ? 'System' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <PermissionsSelect
                              availablePermissions={availablePermissions}
                              selectedPermissions={editingPermissions}
                              onChange={setEditingPermissions}
                              placeholder="Select permissions..."
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {role.permissions.length
                                ? role.permissions.join(', ')
                                : 'No permissions assigned'}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingRoleId(null)
                                  setEditingPermissions([])
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSavePermissions(role.id)}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEdit(role)}
                            >
                              Edit Permissions
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : availablePermissions.length ? (
              <div className="flex flex-wrap gap-2">
                {availablePermissions.map((permission) => (
                  <Badge key={permission} variant="outline">
                    {permission}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No permissions returned by API.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
