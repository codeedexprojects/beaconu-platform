"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  GraduationCap,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  MapPin,
  Loader2,
  ToggleRight,
  ToggleLeft,
  Eye,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { University } from "@/lib/services/universities.service";
import {
  useUniversities,
  useActivateUniversity,
  useDeactivateUniversity,
} from "@/hooks/use-universities";

export default function UniversitiesPage() {
  const [search, setSearch] = useState("");
  const { data: universities = [], isLoading } = useUniversities();
  const activateMutation = useActivateUniversity();
  const deactivateMutation = useDeactivateUniversity();

  const filteredUniversities = useMemo(() => {
    const query = search.toLowerCase();
    return universities.filter(
      (university: University) =>
        university.name.toLowerCase().includes(query) ||
        (university.city ?? "").toLowerCase().includes(query) ||
        (university.state ?? "").toLowerCase().includes(query),
    );
  }, [search, universities]);

  const activeCount = filteredUniversities.filter(
    (university: University) => university.status === "active",
  ).length;

  const handleActivate = (id: string) => {
    activateMutation.mutate(id, {
      onSuccess: () => toast.success("University set to active"),
    });
  };

  const handleDeactivate = (id: string) => {
    deactivateMutation.mutate(id, {
      onSuccess: () => toast.success("University set to inactive"),
    });
  };

  return (
    <div className="relative flex min-h-full flex-col">
      <Header
        title="Universities"
        description="Manage university groups and their affiliated colleges"
      >
        <Button asChild className="gap-2">
          <Link href="/universities/new">
            <Plus className="h-4 w-4" />
            Add University
          </Link>
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background pl-9"
            />
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {activeCount}/{filteredUniversities.length} Active
          </Badge>
        </div>

        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Loading universities...
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[300px]">University</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Accreditation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUniversities.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No universities found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUniversities.map((university: University) => (
                      <TableRow
                        key={university.id}
                        className="group transition-colors hover:bg-muted/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="mb-1 text-sm font-semibold leading-none">
                                {university.name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {university.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-medium"
                          >
                            {university.universityType?.name || "Not set"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {university.city || university.state ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>
                                {[university.city, university.state]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {university.accreditation ? (
                            <span className="text-sm">
                              {university.accreditation}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              university.status === "active"
                                ? "success"
                                : university.status === "archived"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-[10px] capitalize"
                          >
                            {university.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[160px]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2" asChild>
                                <Link href={`/universities/${university.id}`}>
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" asChild>
                                <Link
                                  href={`/universities/${university.id}/edit`}
                                >
                                  <Edit className="h-4 w-4 text-muted-foreground" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {university.status !== "active" && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleActivate(university.id)}
                                >
                                  <ToggleRight className="h-4 w-4 text-muted-foreground" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {university.status !== "inactive" && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() =>
                                    handleDeactivate(university.id)
                                  }
                                >
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
