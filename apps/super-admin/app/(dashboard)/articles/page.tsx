'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText,
  Clock,
  ChevronRight,
  Filter,
  Layers
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const DUMMY_ARTICLES = [
  { id: '1', title: 'A Comprehensive Guide to JEE Mains 2024', type: 'Guide', readTime: '15 min', status: 'live' },
  { id: '2', title: 'Top Medical Colleges in Kerala', type: 'Listing', readTime: '8 min', status: 'live' },
  { id: '3', title: 'Entrance Exams for Design Courses', type: 'Information', readTime: '12 min', status: 'review' },
  { id: '4', title: 'How to write a perfect Statement of Purpose', type: 'Tutorial', readTime: '10 min', status: 'live' },
  { id: '5', title: 'Scholarship opportunities for Engineering', type: 'Listing', readTime: '6 min', status: 'archived' },
]

export default function ArticlesPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Articles" description="Educational guides and long-form articles for students" />
      
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {DUMMY_ARTICLES.map((article) => (
            <Card key={article.id} className="border-none shadow-sm hover:bg-muted/30 transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{article.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        {article.type}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={article.status === 'live' ? 'success' : article.status === 'review' ? 'warning' : 'secondary'} className="capitalize text-[10px]">
                    {article.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
