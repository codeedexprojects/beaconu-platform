"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, Hash, Briefcase, Eye } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCounsellors } from "@/hooks/use-counsellors";
import { getErrorMessage } from "@/lib/api";

export default function CounsellorsPage() {
  const [search, setSearch] = useState("");
  const { data: counsellors, isLoading, error } = useCounsellors();

  const filtered = (counsellors ?? []).filter((c) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      c.full_name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.counsellor_code ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Counsellors"
        description="Manage platform counsellors and their student assignments"
      />

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
              {error ? (
                <div className="p-6 text-sm text-destructive">
                  {getErrorMessage(error)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Counsellor</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Languages</TableHead>
                      <TableHead>Session Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={8}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}

                    {!isLoading && filtered.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-sm text-muted-foreground py-8"
                        >
                          No counsellors found
                        </TableCell>
                      </TableRow>
                    )}

                    {filtered.map((c) => (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>
                          <Link
                            href={`/counsellors/${c.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs shrink-0">
                              {c.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {c.full_name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {c.email}
                              </span>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          {c.counsellor_code ? (
                            <div className="flex items-center gap-1 font-mono text-xs bg-muted px-2 py-1 rounded w-fit">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              {c.counsellor_code}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm capitalize">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            {c.counsellor_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">
                              {c.rating.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {c.known_languages ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">
                            ₹{c.session_fee}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              c.status === "active" ? "success" : "secondary"
                            }
                            className="capitalize"
                          >
                            {c.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/counsellors/${c.id}`}
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
