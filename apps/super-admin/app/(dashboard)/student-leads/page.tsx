'use client'

import { useState } from 'react'
import { 
  Target, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone,
  Mail,
  UserCheck,
  TrendingUp,
  History
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

const DUMMY_LEADS = [
  { id: '1', name: 'Vikram Singh', source: 'Facebook Ad', score: 85, status: 'new', phone: '+91 98765 43210', lastContact: '2 hours ago' },
  { id: '2', name: 'Ayesha Khan', source: 'Referral', score: 92, status: 'contacted', phone: '+91 87654 32109', lastContact: '1 day ago' },
  { id: '3', name: 'Sam Peter', source: 'Google Search', score: 45, status: 'disqualified', phone: '+91 76543 21098', lastContact: '3 days ago' },
  { id: '4', name: 'Meera Nair', source: 'Direct', score: 78, status: 'qualified', phone: '+91 65432 10987', lastContact: '5 hours ago' },
  { id: '5', name: 'Rahul Jain', source: 'Instagram', score: 60, status: 'new', phone: '+91 54321 09876', lastContact: 'Just now' },
]

export default function LeadsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Student Leads" description="Track and manage potential students from various marketing channels" />
      
      <div className="flex-1 space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Total Leads</p>
                  <h3 className="text-2xl font-bold mt-1">1,284</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Conversion Rate</p>
                  <h3 className="text-2xl font-bold mt-1">12.4%</h3>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Hot Leads</p>
                  <h3 className="text-2xl font-bold mt-1">42</h3>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <UserCheck className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Source
            </Button>
            <Button className="gap-2">
              Add Lead
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DUMMY_LEADS.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{lead.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Phone className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{lead.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {lead.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${lead.score > 80 ? 'bg-emerald-500' : lead.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-medium">{lead.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        lead.status === 'qualified' ? 'success' : 
                        lead.status === 'new' ? 'warning' : 
                        lead.status === 'disqualified' ? 'destructive' : 'outline'
                      } className="capitalize">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <History className="h-3 w-3" />
                        {lead.lastContact}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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
