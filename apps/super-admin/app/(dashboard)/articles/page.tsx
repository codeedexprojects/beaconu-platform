import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  User,
  Clock,
  ExternalLink,
  Download
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

const articles = [
  {
    id: '1',
    title: 'The Future of Higher Education in India',
    author: 'Dr. Ramesh Kumar',
    readTime: '8 min',
    status: 'published',
    updatedAt: '2024-05-01',
  },
  {
    id: '2',
    title: 'Digital Transformation in Universities',
    author: 'Sunita Sharma',
    readTime: '12 min',
    status: 'review',
    updatedAt: '2024-05-02',
  },
  {
    id: '3',
    title: 'New Education Policy (NEP) 2020: A Comprehensive Guide',
    author: 'Academic Board',
    readTime: '25 min',
    status: 'published',
    updatedAt: '2024-04-15',
  },
  {
    id: '4',
    title: 'Mental Health Awareness in Campuses',
    author: 'Psychology Dept',
    readTime: '10 min',
    status: 'published',
    updatedAt: '2024-05-05',
  },
]

export default function ArticlesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Articles" 
        description="Comprehensive resources and academic articles"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Write Article
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
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
                  <TableHead className="w-[450px]">Article Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Read Time</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <p className="font-semibold text-sm leading-tight">{article.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {article.author}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          article.status === 'published' 
                            ? 'success' 
                            : 'orange'
                        }
                        className="text-[10px] capitalize"
                      >
                        {article.status}
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
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit Content
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Archive
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
