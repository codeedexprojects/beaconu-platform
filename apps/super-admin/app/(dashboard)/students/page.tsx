import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone,
  BookOpen,
  Calendar,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const students = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 43210',
    course: 'B.Tech CSE',
    college: 'Amity University',
    joinedDate: '2024-03-12',
    status: 'active',
    avatar: '',
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    phone: '+91 87654 32109',
    course: 'MBA Marketing',
    college: 'Christ University',
    joinedDate: '2024-02-28',
    status: 'active',
    avatar: '',
  },
  {
    id: '3',
    name: 'Arjun Singh',
    email: 'arjun.s@example.com',
    phone: '+91 76543 21098',
    course: 'B.Com Honors',
    college: 'Delhi University',
    joinedDate: '2024-01-15',
    status: 'suspended',
    avatar: '',
  },
  {
    id: '4',
    name: 'Ananya Iyer',
    email: 'ananya.i@example.com',
    phone: '+91 65432 10987',
    course: 'MBBS',
    college: 'KMC Manipal',
    joinedDate: '2023-12-05',
    status: 'active',
    avatar: '',
  },
  {
    id: '5',
    name: 'Vikram Mehra',
    email: 'vikram.m@example.com',
    phone: '+91 54321 09876',
    course: 'B.Des',
    college: 'NID Ahmedabad',
    joinedDate: '2023-11-20',
    status: 'inactive',
    avatar: '',
  },
]

export default function StudentsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Students" 
        description="Monitor student activity and profile management"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-9 bg-background"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Total Students:</span> 12,480
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Student</TableHead>
                  <TableHead>Course & College</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm leading-none mb-1">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground">ID: STU-{student.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          {student.course}
                        </div>
                        <p className="text-xs text-muted-foreground ml-5">{student.college}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {student.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(student.joinedDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === 'active' 
                            ? 'success' 
                            : student.status === 'suspended' 
                              ? 'destructive' 
                              : 'secondary'
                        }
                        className="text-[10px] capitalize"
                      >
                        {student.status}
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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Course History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Suspend Account
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
