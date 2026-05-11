'use client'

import { Building2, RefreshCcw, ShieldCheck, Users } from 'lucide-react'
import { ModulePage } from '@/src/components/layouts/module-page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/src/components/ui/empty-state'
import { usePlatformConsole } from '../hooks/use-platform-console'

export function PlatformConsole(): React.JSX.Element {
  const {
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
  } = usePlatformConsole()

  return (
    <ModulePage
      title='Platform'
      description='Profiles, platform roles, and permission assignments for the admin control plane'
      tag='Control Plane'
    >
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm text-muted-foreground'>Students</CardTitle>
          </CardHeader>
          <CardContent className='flex items-center justify-between'>
            <span className='text-2xl font-bold'>{profiles?.students.length ?? 0}</span>
            <Users className='h-5 w-5 text-primary' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm text-muted-foreground'>Blink Profiles</CardTitle>
          </CardHeader>
          <CardContent className='flex items-center justify-between'>
            <span className='text-2xl font-bold'>{profiles?.blinkUsers.length ?? 0}</span>
            <Building2 className='h-5 w-5 text-primary' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm text-muted-foreground'>Platform Roles</CardTitle>
          </CardHeader>
          <CardContent className='flex items-center justify-between'>
            <span className='text-2xl font-bold'>{roles.length}</span>
            <ShieldCheck className='h-5 w-5 text-primary' />
          </CardContent>
        </Card>
      </div>

      <div className='flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm'>
        <div>
          <p className='text-sm font-medium'>Platform admin integration</p>
          <p className='text-sm text-muted-foreground'>Connected to profiles, roles, and permissions endpoints.</p>
        </div>
        <Button variant='outline' size='sm' className='gap-2' onClick={() => void refresh()}>
          <RefreshCcw className='h-4 w-4' />
          Refresh
        </Button>
      </div>

      {error ? (
        <EmptyState title='Unable to load platform data' description={error} />
      ) : null}

      <Tabs defaultValue='profiles' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='profiles'>Profiles</TabsTrigger>
          <TabsTrigger value='roles'>Roles</TabsTrigger>
          <TabsTrigger value='permissions'>Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value='profiles' className='space-y-6'>
          <div className='grid gap-6 xl:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Student Profiles</CardTitle>
                <CardDescription>Fetched from /api/v1/platform-admin/profiles</CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(profiles?.students ?? []).slice(0, 8).map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className='font-medium'>{student.fullName}</TableCell>
                        <TableCell>{student.email ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>{student.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blink Profiles</CardTitle>
                <CardDescription>Agency and blink user visibility</CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(profiles?.blinkUsers ?? []).slice(0, 8).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{user.fullName}</div>
                            <div className='text-xs text-muted-foreground'>{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.agencyName ?? 'Independent'}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>{user.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='roles' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Create Platform Role</CardTitle>
              <CardDescription>Uses POST /api/v1/platform-admin/roles</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Role name</label>
                  <Input
                    value={createRoleForm.name}
                    onChange={(event) => setCreateRoleField('name', event.target.value)}
                    placeholder='Operations Admin'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Role slug</label>
                  <Input
                    value={createRoleForm.slug}
                    onChange={(event) => setCreateRoleField('slug', event.target.value)}
                    placeholder='operations_admin'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Seed permissions</label>
                <div className='flex flex-wrap gap-2'>
                  {permissions.map((permission) => {
                    const active = createRoleForm.permissions.includes(permission)
                    return (
                      <button
                        key={permission}
                        type='button'
                        onClick={() =>
                          setCreateRoleField(
                            'permissions',
                            active
                              ? createRoleForm.permissions.filter((item) => item !== permission)
                              : [...createRoleForm.permissions, permission].sort(),
                          )
                        }
                        className={active
                          ? 'rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
                          : 'rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground'}
                      >
                        {permission}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className='flex justify-end'>
                <Button onClick={() => void createRole()}>Create role</Button>
              </div>
            </CardContent>
          </Card>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {roles.map((role) => (
              <Card key={role.id} className={role.id === selectedRoleId ? 'border-primary' : undefined}>
                <CardHeader>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <CardTitle>{role.name}</CardTitle>
                      <CardDescription>{role.slug}</CardDescription>
                    </div>
                    <Badge variant={role.isActive ? 'success' : 'secondary'}>{role.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    {role.isSystemRole ? <Badge variant='info'>System role</Badge> : <Badge variant='secondary'>Custom role</Badge>}
                    <Badge variant='outline'>{role.permissions.length} permissions</Badge>
                  </div>
                  <Button variant='outline' size='sm' onClick={() => setSelectedRoleId(role.id)}>
                    Manage permissions
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='permissions' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Role Permission Assignment</CardTitle>
              <CardDescription>Uses /api/v1/platform-admin/roles/permissions and /api/v1/platform-admin/roles/:roleId/permissions</CardDescription>
            </CardHeader>
            <CardContent className='space-y-5'>
              <div className='grid gap-4 md:grid-cols-[260px_1fr]'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Selected Role</label>
                  <select
                    className='flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm'
                    value={selectedRoleId ?? ''}
                    onChange={(event) => setSelectedRoleId(event.target.value)}
                  >
                    <option value='' disabled>Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Quick search</label>
                  <Input value='' placeholder='Permission filtering can be added next' readOnly />
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                {permissions.map((permission) => {
                  const active = selectedPermissions.includes(permission)
                  return (
                    <button
                      key={permission}
                      type='button'
                      onClick={() => togglePermission(permission)}
                      className={active
                        ? 'rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
                        : 'rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground'}
                    >
                      {permission}
                    </button>
                  )
                })}
              </div>

              <div className='flex justify-end'>
                <Button onClick={() => void savePermissions()} disabled={loading || !selectedRoleId || selectedPermissions.length === 0}>
                  Save role permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePage>
  )
}
