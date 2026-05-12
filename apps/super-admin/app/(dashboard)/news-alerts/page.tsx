"use client";

import { useState } from "react";
import {
  Newspaper,
  Search,
  Bell,
  Info,
  AlertTriangle,
  MoreVertical,
  Clock,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DUMMY_NEWS = [
  {
    id: "1",
    title: "Admissions Open for B.Tech 2024 at BITS Pilani",
    type: "admission",
    priority: "high",
    date: "Just now",
  },
  {
    id: "2",
    title: "NEET PG Exam Dates Rescheduled to July",
    type: "exam",
    priority: "critical",
    date: "2 hours ago",
  },
  {
    id: "3",
    title: "New Scholarship Program for EWS Category Students",
    type: "scholarship",
    priority: "medium",
    date: "5 hours ago",
  },
  {
    id: "4",
    title: "University of Kerala Results Declared for Semester 4",
    type: "result",
    priority: "medium",
    date: "1 day ago",
  },
  {
    id: "5",
    title: "Webinar: Career Opportunities in AI and Data Science",
    type: "event",
    priority: "low",
    date: "2 days ago",
  },
];

export default function NewsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="News & Alerts"
        description="Publish important updates, admission news, and system alerts"
      />

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Button className="gap-2">
            <Bell className="h-4 w-4" />
            Post Alert
          </Button>
        </div>

        <div className="space-y-3">
          {DUMMY_NEWS.map((item) => (
            <Card
              key={item.id}
              className={`border-none shadow-sm border-l-4 ${
                item.priority === "critical"
                  ? "border-l-destructive"
                  : item.priority === "high"
                    ? "border-l-amber-500"
                    : "border-l-primary"
              }`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`p-2 rounded-full ${
                    item.priority === "critical"
                      ? "bg-destructive/10 text-destructive"
                      : item.priority === "high"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {item.priority === "critical" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-wider h-4"
                    >
                      {item.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm truncate">
                    {item.title}
                  </h3>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
