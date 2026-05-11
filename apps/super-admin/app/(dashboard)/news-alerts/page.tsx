import { 
  Bell, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Megaphone,
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

const alerts = [
  {
    id: '1',
    content: 'JEE Advanced Registration Deadline Extended to May 15th',
    type: 'Critical',
    audience: 'Engineering Students',
    status: 'Active',
    expiresAt: '2024-05-15',
  },
  {
    id: '2',
    content: 'New Scholarship Program Launched for Girl Students',
    type: 'News',
    audience: 'All Students',
    status: 'Active',
    expiresAt: '2024-06-01',
  },
  {
    id: '3',
    content: 'System Maintenance: Dashboard will be offline on Sunday 2AM-4AM',
    type: 'Maintenance',
    audience: 'All Users',
    status: 'Scheduled',
    expiresAt: '2024-05-12',
  },
  {
    id: '4',
    content: 'NEET PG Results Announced. Check yours now!',
    type: 'Update',
    audience: 'Medical Students',
    status: 'Active',
    expiresAt: '2024-05-30',
  },
]

export default function NewsAlertsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="News & Alerts" 
        description="Broadcast important announcements and system alerts"
      >
        <Button className="gap-2 bg-red-600 hover:bg-red-700">
          <Megaphone className="h-4 w-4" />
          Broadcast Alert
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[450px]">Alert Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Expires In</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          alert.type === 'Critical' ? 'bg-red-100 text-red-600' : 
                          alert.type === 'Maintenance' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <p className="font-medium text-sm mt-1">{alert.content}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] font-medium ${
                          alert.type === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' : ''
                        }`}
                      >
                        {alert.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {alert.audience}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.expiresAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={alert.status === 'Active' ? 'success' : 'secondary'}
                        className="text-[10px] capitalize"
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            View Target List
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit Alert
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete
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
