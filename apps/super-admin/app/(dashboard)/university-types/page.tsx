'use client'

import { useState, useMemo } from 'react'
import {
  Tag,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
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

const DUMMY_TYPES = [
  { id: '1', name: 'Central University', slug: 'central_university', description: 'Established by an Act of Parliament', isActive: true },
  { id: '2', name: 'State University', slug: 'state_university', description: 'Run by state governments', isActive: true },
  { id: '3', name: 'Deemed University', slug: 'deemed_university', description: 'High-performing institutions granted autonomy', isActive: true },
  { id: '4', name: 'Private University', slug: 'private_university', description: 'Established through State/Central Act by a sponsoring body', isActive: true },
  { id: '5', name: 'Institute of National Importance', slug: 'ini', description: 'Premier public higher education institutions', isActive: true },
]

export default function UniversityTypesPage() {
  const [search, setSearch] = useState('')

  const filteredTypes = useMemo(() => {
    return DUMMY_TYPES.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const activeCount = filteredTypes.filter(t => t.isActive).length

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="University Types"
        description="Manage university classification types"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Type
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search university types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" className="px-3 py-1 gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {activeCount}/{filteredTypes.length} Active
            </Badge>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="flex-1">Description</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.map((type) => (
                  <TableRow key={type.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Tag className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{type.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {type.slug}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {type.description || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {type.isActive ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>
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
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
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