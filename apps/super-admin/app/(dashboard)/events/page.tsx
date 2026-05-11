import { 
  CalendarDays, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  MapPin, 
  Clock,
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

const events = [
  {
    id: '1',
    name: 'National Education Summit 2024',
    location: 'Pragati Maidan, Delhi',
    type: 'Conference',
    date: '2024-07-12',
    time: '10:00 AM',
    attendees: 1500,
    status: 'Upcoming',
  },
  {
    id: '2',
    name: 'Global Study Abroad Expo',
    location: 'JW Marriott, Mumbai',
    type: 'Expo',
    date: '2024-06-05',
    time: '11:00 AM',
    attendees: 3000,
    status: 'Upcoming',
  },
  {
    id: '3',
    name: 'Tech in Education Workshop',
    location: 'Online (Zoom)',
    type: 'Webinar',
    date: '2024-05-20',
    time: '04:00 PM',
    attendees: 800,
    status: 'Scheduled',
  },
  {
    id: '4',
    name: 'University Placement Drive',
    location: 'Amity Noida Campus',
    type: 'Recruitment',
    date: '2024-05-10',
    time: '09:00 AM',
    attendees: 2500,
    status: 'Live',
  },
]

export default function EventsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Events" 
        description="Schedule and manage education fairs, webinars, and conferences"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
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
                  <TableHead className="w-[300px]">Event Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                          <CalendarDays className="h-5 w-5" />
                        </div>
                        <p className="font-semibold text-sm leading-tight">{event.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                        <div className="text-[10px] text-muted-foreground ml-4">
                          {new Date(event.date).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {event.attendees.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.status === 'Live' ? 'success' : 
                          event.status === 'Upcoming' ? 'info' : 'secondary'
                        }
                        className="text-[10px] capitalize"
                      >
                        {event.status}
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
                            Registration Link
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            Speaker List
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Cancel Event
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
