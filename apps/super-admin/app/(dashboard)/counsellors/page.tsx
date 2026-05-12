"use client";

import { useState } from "react";
import {
  HeartHandshake,
  Search,
  Plus,
  Star,
  Mail,
  Phone,
  CheckCircle2,
  MoreVertical,
  Briefcase,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DUMMY_COUNSELLORS = [
  {
    id: "1",
    name: "Dr. Sameer Gupta",
    email: "sameer@beaconu.com",
    type: "Expert",
    rating: 4.9,
    activeStudents: 24,
    status: "active",
  },
  {
    id: "2",
    name: "Megha Rao",
    email: "megha.r@beaconu.com",
    type: "Senior",
    rating: 4.7,
    activeStudents: 18,
    status: "active",
  },
  {
    id: "3",
    name: "James Wilson",
    email: "james@beaconu.com",
    type: "Expert",
    rating: 4.8,
    activeStudents: 31,
    status: "inactive",
  },
  {
    id: "4",
    name: "Sophia Lee",
    email: "sophia@beaconu.com",
    type: "Junior",
    rating: 4.5,
    activeStudents: 12,
    status: "active",
  },
];

export default function CounsellorsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Counsellors"
        description="Manage platform counsellors and their student assignments"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Counsellor
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search counsellors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Counsellor</TableHead>
                    <TableHead>Expertise Level</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Active Assignments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DUMMY_COUNSELLORS.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {c.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">
                            {c.rating}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {c.activeStudents} Students
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === "active" ? "success" : "secondary"
                          }
                          className="capitalize"
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
