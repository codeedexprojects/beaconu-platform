import { 
  GraduationCap, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  MapPin, 
  Layers,
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

const universities = [
  {
    id: '1',
    name: 'Delhi University',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'Central',
    collegesCount: 77,
    established: 1922,
    status: 'active',
  },
  {
    id: '2',
    name: 'Anna University',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'State',
    collegesCount: 500,
    established: 1978,
    status: 'active',
  },
  {
    id: '3',
    name: 'Mumbai University',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'State',
    collegesCount: 711,
    established: 1857,
    status: 'active',
  },
  {
    id: '4',
    name: 'Jawaharlal Nehru University',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'Central',
    collegesCount: 1,
    established: 1969,
    status: 'active',
  },
  {
    id: '5',
    name: 'Savitribai Phule Pune University',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'State',
    collegesCount: 612,
    established: 1949,
    status: 'inactive',
  },
]

export default function UniversitiesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Universities" 
        description="Manage university groups and their affiliated colleges"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add University
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search universities..."
                className="pl-9 bg-background"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              Total Groups: {universities.length}
            </Badge>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">University</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Affiliated Colleges</TableHead>
                  <TableHead className="text-right">Est. Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((university) => (
                  <TableRow key={university.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-none mb-1">{university.name}</p>
                          <p className="text-[10px] text-muted-foreground">ID: UNIV-{university.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{university.city}, {university.state}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {university.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 font-medium">
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        {university.collegesCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground text-sm">
                      {university.established}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={university.status === 'active' ? 'success' : 'secondary'}
                        className="text-[10px] capitalize"
                      >
                        {university.status}
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
                            Affiliated Colleges
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Remove Group
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
