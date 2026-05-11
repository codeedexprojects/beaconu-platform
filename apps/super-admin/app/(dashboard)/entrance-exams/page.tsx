import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  ExternalLink,
  Users
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

const exams = [
  {
    id: '1',
    name: 'JEE Main 2024',
    category: 'Engineering',
    conductingBody: 'NTA',
    examDate: '2024-06-24',
    applicants: '11.5 Lakhs',
    status: 'Upcoming',
  },
  {
    id: '2',
    name: 'NEET UG 2024',
    category: 'Medical',
    conductingBody: 'NTA',
    examDate: '2024-05-05',
    applicants: '20.8 Lakhs',
    status: 'Closed',
  },
  {
    id: '3',
    name: 'CAT 2024',
    category: 'Management',
    conductingBody: 'IIM Lucknow',
    examDate: '2024-11-24',
    applicants: '3.3 Lakhs',
    status: 'Scheduled',
  },
  {
    id: '4',
    name: 'CLAT 2025',
    category: 'Law',
    conductingBody: 'Consortium of NLUs',
    examDate: '2024-12-01',
    applicants: '75,000',
    status: 'Scheduled',
  },
  {
    id: '5',
    name: 'CUET UG 2024',
    category: 'Undergraduate',
    conductingBody: 'NTA',
    examDate: '2024-05-15',
    applicants: '14.9 Lakhs',
    status: 'Live',
  },
]

export default function EntranceExamsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Entrance Exams" 
        description="Monitor and manage all national & state level entrance exams"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Exam
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
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
                  <TableHead className="w-[300px]">Exam Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Conducting Body</TableHead>
                  <TableHead className="text-right">Est. Applicants</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <p className="font-semibold text-sm leading-tight">{exam.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {exam.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {exam.conductingBody}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {exam.applicants}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(exam.examDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          exam.status === 'Live' ? 'success' : 
                          exam.status === 'Upcoming' ? 'info' :
                          exam.status === 'Closed' ? 'destructive' : 'secondary'
                        }
                        className="text-[10px] capitalize"
                      >
                        {exam.status}
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
                            Official Site
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Exam Centers
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Remove
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
