"use client";

import { useState } from "react";
import {
  Calendar,
  Search,
  Plus,
  MapPin,
  Clock,
  Users,
  Video,
  Ticket,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DUMMY_EVENTS = [
  {
    id: "1",
    title: "Global Education Fair 2024",
    type: "Offline",
    location: "Pragati Maidan, Delhi",
    date: "May 25, 2024",
    time: "10:00 AM",
    registrations: 450,
  },
  {
    id: "2",
    title: "Webinar: Studying in Germany",
    type: "Online",
    location: "Zoom",
    date: "May 28, 2024",
    time: "4:00 PM",
    registrations: 1200,
  },
  {
    id: "3",
    title: "Career Guidance Workshop",
    type: "Offline",
    location: "BeaconU Hub, Bangalore",
    date: "June 05, 2024",
    time: "11:30 AM",
    registrations: 85,
  },
  {
    id: "4",
    title: "Scholarship Test Drive",
    type: "Online",
    location: "BeaconU Portal",
    date: "June 10, 2024",
    time: "2:00 PM",
    registrations: 3400,
  },
];

export default function EventsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Events"
        description="Plan and manage educational fairs, webinars, and workshops"
      />

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DUMMY_EVENTS.map((event) => (
            <Card
              key={event.id}
              className="border-none shadow-sm overflow-hidden flex"
            >
              <div className="w-2 bg-primary shrink-0" />
              <CardContent className="p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={event.type === "Online" ? "outline" : "secondary"}
                    className="gap-1 px-2"
                  >
                    {event.type === "Online" ? (
                      <Video className="h-3 w-3" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    {event.type}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                    <Users className="h-3.5 w-3.5" />
                    {event.registrations} Registrations
                  </div>
                </div>
                <h3 className="font-bold text-base mb-3">{event.title}</h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button size="sm" className="flex-1 gap-2">
                    <Ticket className="h-3.5 w-3.5" />
                    Manage Registrations
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
