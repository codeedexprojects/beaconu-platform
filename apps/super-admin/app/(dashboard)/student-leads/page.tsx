import { 
  Target, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  MessageSquare, 
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink
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

const leads = [
  {
    id: '1',
    name: 'Siddharth Varma',
    email: 'sid.v@gmail.com',
    source: 'Website Form',
    interestedIn: 'B.Tech CSE',
    score: 85,
    lastAction: 'Called',
    status: 'hot',
    createdAt: '2024-05-01T10:30:00Z',
  },
  {
    id: '2',
    name: 'Kritika Sharma',
    email: 'kriti.s@outlook.com',
    source: 'Social Media',
    interestedIn: 'MBA Global',
    score: 62,
    lastAction: 'WhatsApp Sent',
    status: 'warm',
    createdAt: '2024-05-02T14:20:00Z',
  },
  {
    id: '3',
    name: 'Mohit Malhotra',
    email: 'mohit.m@yahoo.com',
    source: 'Referral',
    interestedIn: 'Law (LLM)',
    score: 94,
    lastAction: 'Document Uploaded',
    status: 'qualified',
    createdAt: '2024-05-03T09:15:00Z',
  },
  {
    id: '4',
    name: 'Ishani Roy',
    email: 'ishani.roy@gmail.com',
    source: 'Google Ads',
    interestedIn: 'Medicine',
    score: 45,
    lastAction: 'Emailed',
    status: 'cold',
    createdAt: '2024-05-04T11:45:00Z',
  },
  {
    id: '5',
    name: 'Aman Deep',
    email: 'aman.d@gmail.com',
    source: 'Webinar',
    interestedIn: 'B.Arch',
    score: 78,
    lastAction: 'Called',
    status: 'warm',
    createdAt: '2024-05-05T16:00:00Z',
  },
]

export default function StudentLeadsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Student Leads" 
        description="Track and convert potential student inquiries"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-orange-50 border-orange-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600 uppercase">Hot Leads</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase">Qualified</p>
                <p className="text-2xl font-bold">128</p>
              </div>
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <Target className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase">Response Rate</p>
                <p className="text-2xl font-bold">76%</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <MessageSquare className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-9 bg-background"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[250px]">Lead Name</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-center">Lead Score</TableHead>
                  <TableHead>Last Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm leading-none mb-1">{lead.name}</p>
                        <p className="text-[10px] text-muted-foreground">{lead.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {lead.interestedIn}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.source}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full border-2 border-primary/20 text-[10px] font-bold text-primary">
                        {lead.score}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {lead.lastAction}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lead.status === 'hot' 
                            ? 'orange' 
                            : lead.status === 'qualified' 
                              ? 'success' 
                              : lead.status === 'warm'
                                ? 'info'
                                : 'secondary'
                        }
                        className="text-[10px] capitalize"
                      >
                        {lead.status}
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
                            View Journey
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            Convert to Student
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Discard Lead
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
