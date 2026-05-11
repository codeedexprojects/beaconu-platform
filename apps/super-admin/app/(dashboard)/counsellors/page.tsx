import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Star,
  ShieldCheck,
  Briefcase,
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

const counsellors = [
  {
    id: '1',
    name: 'Dr. Sameer Khanna',
    specialization: 'Career Guidance',
    experience: '12 Years',
    rating: 4.9,
    leadsHandled: 450,
    status: 'active',
    avatar: '',
  },
  {
    id: '2',
    name: 'Meera Deshmukh',
    specialization: 'Study Abroad',
    experience: '8 Years',
    rating: 4.7,
    leadsHandled: 320,
    status: 'active',
    avatar: '',
  },
  {
    id: '3',
    name: 'Amitabh Bachchan',
    specialization: 'Soft Skills',
    experience: '15 Years',
    rating: 5.0,
    leadsHandled: 890,
    status: 'active',
    avatar: '',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    specialization: 'Psychological Counselling',
    experience: '6 Years',
    rating: 4.5,
    leadsHandled: 120,
    status: 'inactive',
    avatar: '',
  },
  {
    id: '5',
    name: 'Karan Johar',
    specialization: 'Admission Expert',
    experience: '10 Years',
    rating: 4.8,
    leadsHandled: 670,
    status: 'active',
    avatar: '',
  },
]

export default function CounsellorsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Counsellors" 
        description="Manage expert counsellors and their assignments"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Counsellor
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search counsellors..."
                className="pl-9 bg-background"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" className="px-3 py-1 gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verified Experts
            </Badge>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Counsellor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead className="text-center">Experience</TableHead>
                  <TableHead className="text-right">Leads Managed</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counsellors.map((counsellor) => (
                  <TableRow key={counsellor.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={counsellor.avatar} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                            {counsellor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm leading-none mb-1">{counsellor.name}</p>
                          <p className="text-[10px] text-muted-foreground">ID: CNS-{counsellor.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        {counsellor.specialization}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {counsellor.experience}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {counsellor.leadsHandled}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {counsellor.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={counsellor.status === 'active' ? 'success' : 'secondary'}
                        className="text-[10px] capitalize"
                      >
                        {counsellor.status}
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
                            View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            View Reviews
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Deactivate
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
