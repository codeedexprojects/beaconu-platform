'use client'

import { useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  GraduationCap,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2
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

const DUMMY_STUDENTS = [
  { id: '1', name: 'Arjun Verma', email: 'arjun.v@gmail.com', city: 'Delhi', course: 'Computer Science', status: 'enrolled', joined: '2024-01-15' },
  { id: '2', name: 'Sneha Reddy', email: 'sneha.r@outlook.com', city: 'Hyderabad', course: 'Business Analytics', status: 'applied', joined: '2024-02-20' },
  { id: '3', name: 'Karthik S', email: 'karthik.s@yahoo.com', city: 'Bangalore', course: 'Mechanical Engineering', status: 'verified', joined: '2024-03-05' },
  { id: '4', name: 'Anjali Gupta', email: 'anjali.g@gmail.com', city: 'Mumbai', course: 'Psychology', status: 'enrolled', joined: '2024-01-22' },
  { id: '5', name: 'Rohan Mehra', email: 'rohan.m@gmail.com', city: 'Pune', course: 'Fine Arts', status: 'dropped', joined: '2024-02-10' },
]

export default function StudentsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Students" description="View and manage all registered students across the platform" />
      
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course Interested</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DUMMY_STUDENTS.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{student.name}</span>
                        <span className="text-xs text-muted-foreground">{student.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        {student.course}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {student.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'enrolled' ? 'success' : student.status === 'dropped' ? 'destructive' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(student.joined).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
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
