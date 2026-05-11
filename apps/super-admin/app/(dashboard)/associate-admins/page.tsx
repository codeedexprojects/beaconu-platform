'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Building2,
  CheckCircle2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useAssociateAdmins } from '@/src/modules/associate-admins/hooks/use-associate-admins'

function getStatusVariant(status: string): 'success' | 'secondary' | 'destructive' | 'outline' {
  const normalized = status.toLowerCase()
  if (normalized === 'active') return 'success'
  if (normalized === 'pending_approval') return 'outline'
  if (normalized === 'rejected' || normalized === 'suspended') return 'destructive'
  return 'secondary'
}

export default function AssociateAdminsPage(): React.JSX.Element {
  const [search, setSearch] = useState('')
  const {
    associateAdmins,
    totalAssociateAdmins,
    loading,
    error,
    approvingId,
    approve,
    reject,
    refresh,
  } = useAssociateAdmins(search)

  const pendingCount = useMemo(
    () => associateAdmins.filter((item) => item.status.toLowerCase() === 'pending_approval').length,
    [associateAdmins],
  )

  return (
    <div className='flex min-h-full flex-col'>
      <Header
        title='Associate Admins'
        description='Review and approve associate admin registrations'
      >
        <Button variant='outline' className='gap-2' onClick={() => void refresh()}>
          <RefreshCcw className='h-4 w-4' />
          Refresh
        </Button>
      </Header>

      <div className='flex-1 space-y-4 p-6'>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <Card>
            <CardContent className='flex items-center justify-between p-4'>
              <div>
                <p className='text-xs text-muted-foreground'>Total Associate Admins</p>
                <p className='mt-1 text-2xl font-semibold'>{totalAssociateAdmins}</p>
              </div>
              <Users className='h-5 w-5 text-primary' />
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center justify-between p-4'>
              <div>
                <p className='text-xs text-muted-foreground'>Pending Approval</p>
                <p className='mt-1 text-2xl font-semibold'>{pendingCount}</p>
              </div>
              <ShieldCheck className='h-5 w-5 text-primary' />
            </CardContent>
          </Card>
        </div>

        <div className='flex items-center justify-between gap-3'>
          <div className='relative max-w-sm flex-1'>
            <Search className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search associate admins...'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className='pl-9'
            />
          </div>
          <Badge variant='info' className='gap-1.5 px-3 py-1'>
            <Building2 className='h-3.5 w-3.5' />
            Super Admin Approval Flow
          </Badge>
        </div>

        <Card className='overflow-hidden border-none shadow-sm'>
          <CardContent className='p-0'>
            <Table>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead>Associate Admin</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead className='w-[180px] text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center text-sm text-muted-foreground'>
                      Loading associate admins...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center text-sm text-destructive'>
                      {error}
                    </TableCell>
                  </TableRow>
                ) : associateAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center text-sm text-muted-foreground'>
                      No associate admins found.
                    </TableCell>
                  </TableRow>
                ) : (
                  associateAdmins.map((item) => {
                    const isPending = item.status.toLowerCase() === 'pending_approval'
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className='font-medium'>{item.fullName}</p>
                            <p className='text-xs text-muted-foreground'>{item.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className='text-sm font-medium'>{item.agencyName ?? 'Independent'}</p>
                            <p className='text-xs text-muted-foreground'>Reg: {item.agencyRegNumber ?? 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(item.status)}>
                            {item.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm'>{item.employeesCount}</span>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              size='sm'
                              variant='success'
                              className={cn('gap-1.5', !isPending && 'opacity-70')}
                              onClick={async () => {
                                const success = await approve(item.id)
                                if (success) toast.success('Associate Admin approved')
                                else toast.error('Failed to approve')
                              }}
                              disabled={!isPending || approvingId === item.id}
                            >
                              <CheckCircle2 className='h-4 w-4' />
                              {approvingId === item.id ? 'Approving...' : 'Approve'}
                            </Button>
                            {isPending && (
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={async () => {
                                  const success = await reject(item.id)
                                  if (success) toast.success('Associate Admin rejected')
                                  else toast.error('Failed to reject')
                                }}
                                disabled={approvingId === item.id}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}