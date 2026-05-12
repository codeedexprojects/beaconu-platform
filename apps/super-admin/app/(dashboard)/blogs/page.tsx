'use client'

import { useState } from 'react'
import { 
  FileText, 
  Search, 
  Plus, 
  Eye,
  Calendar,
  User,
  ExternalLink,
  Edit2,
  Trash2
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const DUMMY_BLOGS = [
  { id: '1', title: 'Top 10 Engineering Colleges in India 2024', author: 'Aditi Sharma', views: '1.2k', date: 'May 10, 2024', status: 'published', category: 'Education' },
  { id: '2', title: 'How to Choose the Right Study Abroad Program', author: 'Michael Page', views: '850', date: 'May 08, 2024', status: 'draft', category: 'Career' },
  { id: '3', title: 'Understanding the New NEET Exam Pattern', author: 'Dr. Vivek', views: '3.4k', date: 'May 05, 2024', status: 'published', category: 'Entrance Exams' },
  { id: '4', title: 'Life at IIT Madras: A Student Experience', author: 'Siddharth R', views: '1.1k', date: 'May 01, 2024', status: 'published', category: 'College Life' },
]

export default function BlogsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Blogs" description="Create and manage blog posts for the platform">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </Header>
      
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DUMMY_BLOGS.map((blog) => (
            <Card key={blog.id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={blog.status === 'published' ? 'success' : 'secondary'} className="capitalize">
                    {blog.status}
                  </Badge>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{blog.category}</span>
                </div>
                <h3 className="font-bold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {blog.author}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {blog.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {blog.views} views
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 p-3 flex items-center justify-between">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
