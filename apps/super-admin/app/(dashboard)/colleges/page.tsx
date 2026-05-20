"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  ExternalLink,
  MapPin,
  GraduationCap,
  Users,
  Globe,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useColleges, useCollegeStats } from "@/hooks/use-colleges";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  }
> = {
  active: {
    label: "Active",
    variant: "default",
    icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
  },
  pending_setup: {
    label: "Pending Setup",
    variant: "secondary",
    icon: <AlertCircle className="h-3 w-3 mr-1" />,
  },
};

export default function CollegesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const getCollegeLink = (slug: string) => {
    if (typeof window === "undefined") return "";
    const hostname = window.location.hostname;
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return `http://${slug}.localhost:3002`;
    }
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      const baseDomain = parts.slice(-2).join(".");
      return `https://${slug}.${baseDomain}`;
    }
    return `https://${slug}.beaconu.com`;
  };

  const { data: stats } = useCollegeStats();
  const {
    data: result,
    isLoading,
    error,
  } = useColleges({ search, status, page, limit: 20 });

  const colleges = result?.data ?? [];
  const meta = result?.meta;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Colleges"
        description="All registered colleges and their portal status"
      />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Colleges</p>
              <p className="text-3xl font-bold mt-1">{stats?.total ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Active Portals</p>
              <p className="text-3xl font-bold mt-1 text-emerald-500">
                {stats?.active ?? "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Pending Setup</p>
              <p className="text-3xl font-bold mt-1 text-amber-500">
                {stats?.pending ?? "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="colleges-search"
                  placeholder="Search by name, code, city..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={!status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(undefined)}
                >
                  All
                </Button>
                <Button
                  variant={status === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus("active")}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Button>
                <Button
                  variant={status === "pending_setup" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus("pending_setup")}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {meta?.total !== undefined
                ? `${meta.total} college${meta.total !== 1 ? "s" : ""}`
                : "Colleges"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <AlertCircle className="h-8 w-8" />
                <p>Failed to load colleges</p>
              </div>
            ) : colleges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <Building2 className="h-10 w-10 opacity-30" />
                <p className="text-sm">No colleges found</p>
                <p className="text-xs">
                  Colleges appear here after an onboarding lead is approved
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Portal Subdomain</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Campuses</TableHead>
                    <TableHead className="text-center">Courses</TableHead>
                    <TableHead className="text-center">Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleges.map((college) => {
                    const statusConfig =
                      STATUS_CONFIG[college.status] ??
                      STATUS_CONFIG.pending_setup;
                    const link = getCollegeLink(college.slug);
                    const cleanLinkDisplay = link.replace(/^https?:\/\//, "");
                    return (
                      <TableRow key={college.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {college.logoUrl ? (
                              <img
                                src={college.logoUrl}
                                alt={college.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm leading-tight">
                                {college.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {college.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-xs">
                              {cleanLinkDisplay}
                            </span>
                            {college.status === "active" && (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3 ml-1 text-blue-400 hover:text-blue-300" />
                              </a>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {[college.city, college.state]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="text-sm font-medium">
                            {college._count.campuses}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <GraduationCap className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {college._count.courses}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {college._count.staffMembers}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={statusConfig.variant}
                            className="flex items-center w-fit text-xs"
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-xs">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
