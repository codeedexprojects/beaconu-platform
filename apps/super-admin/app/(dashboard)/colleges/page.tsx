'use client'

import { useState, useMemo } from 'react'
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  MapPin, 
  GraduationCap,
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
import { formatNumber } from '@/lib/utils'

const DUMMY_COLLEGES = [
  {
    id: '1',
    name: 'Amity University',
    city: 'Noida',
    state: 'Uttar Pradesh',
    code: 'AMITY-N',
    courses: 42,
    students: 1240,
    status: 'active',
    university: { name: 'Amity Group' }
  },
  {
    id: '2',
    name: 'University of Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    code: 'UOH-01',
    courses: 38,
    students: 980,
    status: 'active',
    university: { name: 'Central University' }
  },
  {
    id: '3',
    name: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    code: 'IITB-M',
    courses: 56,
    students: 2100,
    status: 'active',
    university: { name: 'IIT Group' }
  },
  {
    id: '4',
    name: 'Christ University',
    city: 'Bengaluru',
    state: 'Karnataka',
    code: 'CU-B',
    courses: 29,
    students: 760,
    status: 'active',
    university: { name: 'Christ Group' }
  },
  {
    id: '5',
    name: 'Manipal Academy',
    city: 'Manipal',
    state: 'Karnataka',
    code: 'MAHE-M',
    courses: 61,
    students: 1820,
    status: 'inactive',
    university: { name: 'Manipal Group' }
  }
]

export default function CollegesPage() {
  const [search, setSearch] = useState('')

  const filteredColleges = useMemo(() => {
    return DUMMY_COLLEGES.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Colleges" 
        description="Manage and monitor all onboarded colleges"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add College
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              Total: {filteredColleges.length}
            </Badge>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">College</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Courses</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColleges.map((college) => (
                  <TableRow key={college.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-none mb-1">{college.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <GraduationCap className="h-3 w-3" />
                            {college.university.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{college.city}, {college.state}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {college.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {college.courses}
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground">
                      {formatNumber(college.students)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={college.status === 'active' ? 'success' : 'secondary'}
                        className="text-[10px] capitalize"
                      >
                        {college.status}
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit College
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Delete College
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
