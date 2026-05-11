import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  User,
  Calendar,
  Eye,
  MessageSquare,
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

const blogs = [
  {
    id: '1',
    title: 'Top 10 Engineering Colleges in 2024',
    author: 'Admin',
    category: 'Education',
    views: '1.2k',
    comments: 24,
    publishDate: '2024-04-20',
    status: 'published',
  },
  {
    id: '2',
    title: 'How to Choose the Right MBA Program',
    author: 'Expert Writer',
    category: 'Career Advice',
    views: '850',
    comments: 12,
    publishDate: '2024-04-22',
    status: 'published',
  },
  {
    id: '3',
    title: 'Scholarships for International Students',
    author: 'Counsellor Meera',
    category: 'Financial Aid',
    views: '2.4k',
    comments: 56,
    publishDate: '2024-04-25',
    status: 'draft',
  },
  {
    id: '4',
    title: 'Campus Life at IIT Bombay: An Insider View',
    author: 'Student Blogger',
    category: 'Campus Life',
    views: '3.1k',
    comments: 89,
    publishDate: '2024-04-28',
    status: 'published',
  },
  {
    id: '5',
    title: 'Entrance Exam Preparation Strategies',
    author: 'Admin',
    category: 'Exams',
    views: '1.5k',
    comments: 32,
    publishDate: '2024-05-01',
    status: 'scheduled',
  },
]

export default function BlogsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Blogs" 
        description="Manage educational content and insights"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Blog
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blogs..."
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
                  <TableHead className="w-[400px]">Blog Post</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-center">Engagement</TableHead>
                  <TableHead>Publish Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-tight mb-1">{blog.title}</p>
                          <p className="text-[10px] text-muted-foreground">ID: BLOG-{blog.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {blog.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {blog.author}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {blog.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {blog.comments}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(blog.publishDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          blog.status === 'published' 
                            ? 'success' 
                            : blog.status === 'draft' 
                              ? 'secondary' 
                              : 'info'
                        }
                        className="text-[10px] capitalize"
                      >
                        {blog.status}
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
                            View Online
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit Content
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Delete Post
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
