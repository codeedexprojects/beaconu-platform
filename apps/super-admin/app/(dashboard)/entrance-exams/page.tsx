"use client";

import { useState } from "react";
import {
  PenLine,
  Search,
  Plus,
  Calendar,
  Globe,
  Award,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DUMMY_EXAMS = [
  {
    id: "1",
    name: "JEE Main 2024",
    level: "National",
    category: "Engineering",
    date: "April 2024",
    website: "jeemain.nta.nic.in",
  },
  {
    id: "2",
    name: "NEET UG 2024",
    level: "National",
    category: "Medical",
    date: "May 5, 2024",
    website: "neet.nta.nic.in",
  },
  {
    id: "3",
    name: "CUET UG 2024",
    level: "National",
    category: "General",
    date: "May 15-31, 2024",
    website: "cuet.samarth.ac.in",
  },
  {
    id: "4",
    name: "CLAT 2024",
    level: "National",
    category: "Law",
    date: "December 2023",
    website: "consortiumofnlus.ac.in",
  },
  {
    id: "5",
    name: "GATE 2024",
    level: "National",
    category: "Post Grad",
    date: "February 2024",
    website: "gate2024.iisc.ac.in",
  },
];

export default function ExamsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Entrance Exams"
        description="Manage information and dates for national and state level entrance exams"
      />

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Exam
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DUMMY_EXAMS.map((exam) => (
            <Card
              key={exam.id}
              className="border-none shadow-sm hover:ring-1 hover:ring-primary/20 transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <PenLine className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold"
                  >
                    {exam.category}
                  </Badge>
                </div>
                <h3 className="font-bold text-base mb-1">{exam.name}</h3>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Exam Date:{" "}
                    <span className="text-foreground font-medium">
                      {exam.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Award className="h-3.5 w-3.5" />
                    Level:{" "}
                    <span className="text-foreground font-medium">
                      {exam.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="text-primary truncate underline cursor-pointer">
                      {exam.website}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-4 h-9 group justify-between px-2"
                >
                  <span className="text-xs font-medium">Manage Details</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
