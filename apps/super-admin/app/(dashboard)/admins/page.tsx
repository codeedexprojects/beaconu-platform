'use client'

import { useMemo, useState } from 'react'
import {
  ShieldCheck,
  Search,
  Plus,
  MoreHorizontal,
  ShieldAlert,
  Key,
  UserCog,
  Mail,
  Clock,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { apiAction } from '@/lib/api'
import { useAdmins } from '@/src/modules/admins/hooks/use-admins'
import { platformService } from '@/src/modules/platform/services/platform.service'
import type { PlatformRole } from '@/src/modules/platform/types'
import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function formatActivityDate(value: string | null, fallback: string) {
  const dateValue = value ?? fallback
  const timestamp = new Date(dateValue)

  if (Number.isNaN(timestamp.getTime())) {
    return 'No activity yet'
  }

  const diffMs = Date.now() - timestamp.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Active now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours} hr ago`
  if (diffDays < 7) return `${diffDays} day ago${diffDays > 1 ? 's' : ''}`

  return timestamp.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getRoleBadgeClass(roleSlug: string | null) {
  switch (roleSlug) {
    case 'super_admin':
      return 'bg-red-50 text-red-700 border-red-100'
    case 'platform_admin':
      return 'bg-blue-50 text-blue-700 border-blue-100'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-100'
  }
}

export default function AdminsPage() {
  const [search, setSearch] = useState('')
  const { admins, totalAdmins, loading, error, create, refresh } = useAdmins(search)
  const [isCreating, setIsCreating] = useState(false)
  const [roles, setRoles] = useState<PlatformRole[]>([])
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    platformRoleId: '',
  })

  useEffect(() => {
    platformService.getRoles().then(setRoles).catch(console.error)
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName || !formData.email || !formData.password || !formData.platformRoleId) {
      toast.error('Please fill all fields')
      return
    }

    const result = await create(formData)
    if (result.success) {
      toast.success('Admin created successfully')
      setIsCreating(false)
      setFormData({ fullName: '', email: '', password: '', platformRoleId: '' })
    } else {
      toast.error(result.error || 'Failed to create admin')
    }
  }

  const activeAdmins = useMemo(
    () => admins.filter((admin) => admin.status.toLowerCase() === 'active').length,
    [admins],
  )

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Admins"
        description="Manage system administrators and their access levels"
      >
        <Button className="gap-2" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4" />
          Add New Admin
        </Button>
      </Header>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add New Administrator</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Platform Role</Label>
                  <select
                    id="role"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.platformRoleId}
                    onChange={(e) => setFormData({ ...formData, platformRoleId: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full mt-2">
                  Create Administrator
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search administrators..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" className="px-3 py-1 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {activeAdmins}/{totalAdmins} Active
            </Badge>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Administrator</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      Loading admins from backend...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      No admins matched your search.
                    </TableCell>
                  </TableRow>
                ) : admins.map((admin) => (
                  <TableRow key={admin.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={admin.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {admin.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm leading-none mb-1">{admin.fullName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider",
                          getRoleBadgeClass(admin.role?.slug ?? null),
                        )}
                      >
                        {(admin.role?.name ?? 'Unassigned').replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatActivityDate(admin.lastLoginAt, admin.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          admin.status.toLowerCase() === 'active' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                        )} />
                        <span className="text-xs font-medium capitalize">{admin.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <ShieldAlert className="h-4 w-4" />
                            Deactivate Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

