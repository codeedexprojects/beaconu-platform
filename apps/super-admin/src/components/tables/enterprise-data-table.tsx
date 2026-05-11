import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface EnterpriseRow {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
}

export function EnterpriseDataTable({ rows }: { rows: EnterpriseRow[] }): React.JSX.Element {
  return (
    <div className='rounded-2xl border bg-card p-4 shadow-sm'>
      <div className='mb-4 flex items-center gap-2'>
        <Search className='h-4 w-4 text-muted-foreground' />
        <Input placeholder='Search records...' className='h-9 max-w-sm' />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className='font-medium'>{row.name}</TableCell>
              <TableCell>
                <Badge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'secondary'}>
                  {row.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
