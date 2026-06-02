"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  GraduationCap,
  Users,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Landmark,
  Hash,
  Mail,
  BadgeCheck,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCollegeById } from "@/hooks/use-colleges";
import { getCollegeLink } from "@/lib/college-url";

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "overview" | "campuses" | "courses" | "staff";

// ── Constants ──────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "campuses", label: "Campuses" },
  { id: "courses", label: "Courses" },
  { id: "staff", label: "Staff" },
];

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  pending_setup: {
    label: "Pending Setup",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-50 text-gray-500 border-gray-200",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

const STUDY_MODE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  online: "Online",
  distance: "Distance",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-500 border-gray-200",
    icon: null,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
        config.className,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Info Row ───────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

// ── Tab Nav ────────────────────────────────────────────────────────────────

function TabNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <div className="flex gap-1 border-b mb-6">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === t.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: college, isLoading, error } = useCollegeById(id);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <Header title="College Detail" />
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────

  if (error || !college) {
    return (
      <>
        <Header title="College Detail" />
        <div className="p-6 flex flex-col items-center justify-center gap-3 text-center h-64">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">College not found.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/colleges">Back to Colleges</Link>
          </Button>
        </div>
      </>
    );
  }

  const adminLink = getCollegeLink(college.slug);

  return (
    <>
      <Header title="College Detail" />

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Back */}
        <Link
          href="/colleges"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Colleges
        </Link>

        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
            {college.logoUrl ? (
              <img
                src={college.logoUrl}
                alt={college.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold truncate">{college.name}</h1>
              <StatusBadge status={college.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {college.code}
              {college.city && college.state
                ? ` · ${college.city}, ${college.state}`
                : (college.city ?? college.state ?? "")}
            </p>
            {college.university && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {college.university.name}
              </p>
            )}
          </div>

          {adminLink && (
            <Button variant="outline" size="sm" asChild>
              <a href={adminLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open Admin Portal
              </a>
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Building2 className="h-5 w-5" />}
            label="Campuses"
            value={college._count.campuses}
          />
          <StatCard
            icon={<GraduationCap className="h-5 w-5" />}
            label="Courses"
            value={college._count.courses}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Staff Members"
            value={college._count.staffMembers}
          />
        </div>

        {/* Tabs */}
        <TabNav active={activeTab} onChange={setActiveTab} />

        {/* ── Overview ────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Basic Info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow
                  icon={<Hash className="h-4 w-4" />}
                  label="College Code"
                  value={college.code}
                />
                {college.domain && (
                  <InfoRow
                    icon={<Globe className="h-4 w-4" />}
                    label="Domain"
                    value={
                      <a
                        href={`https://${college.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {college.domain}
                      </a>
                    }
                  />
                )}
                {college.university && (
                  <InfoRow
                    icon={<Landmark className="h-4 w-4" />}
                    label="University"
                    value={college.university.name}
                  />
                )}
                <InfoRow
                  icon={<BadgeCheck className="h-4 w-4" />}
                  label="Status"
                  value={<StatusBadge status={college.status} />}
                />
                <InfoRow
                  icon={<BookOpen className="h-4 w-4" />}
                  label="Joined"
                  value={formatDate(college.createdAt)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {college.address && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Address"
                    value={college.address}
                  />
                )}
                {college.city && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="City"
                    value={college.city}
                  />
                )}
                {college.state && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="State"
                    value={college.state}
                  />
                )}
                {college.district && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="District"
                    value={college.district}
                  />
                )}
                {college.pinCode && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Pin Code"
                    value={college.pinCode}
                  />
                )}
                {!college.address &&
                  !college.city &&
                  !college.state &&
                  !college.district &&
                  !college.pinCode && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No location info set
                    </p>
                  )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Campuses ────────────────────────────────────────────────── */}
        {activeTab === "campuses" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Campuses ({college.campuses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {college.campuses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  No campuses added yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {college.campuses.map((campus) => (
                      <TableRow key={campus.id}>
                        <TableCell className="font-medium">
                          {campus.name}
                        </TableCell>
                        <TableCell>{campus.city ?? "—"}</TableCell>
                        <TableCell>{campus.state ?? "—"}</TableCell>
                        <TableCell>
                          {campus.isMainCampus ? (
                            <Badge variant="secondary">Main</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Branch
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={campus.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Courses ─────────────────────────────────────────────────── */}
        {activeTab === "courses" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Courses ({college.courses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {college.courses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  No courses added yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Stream</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Intake</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {college.courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <p className="font-medium">{course.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.code}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {course.discipline.stream.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.discipline.name}
                          </p>
                        </TableCell>
                        <TableCell>{course.studyLevel.name}</TableCell>
                        <TableCell>
                          {STUDY_MODE_LABELS[course.studyMode] ??
                            course.studyMode}
                        </TableCell>
                        <TableCell className="text-right">
                          {course.intakeCapacity ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Staff ───────────────────────────────────────────────────── */}
        {activeTab === "staff" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Staff Members ({college.staffMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {college.staffMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  No staff members yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {college.staffMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                              {member.fullName.charAt(0).toUpperCase()}
                            </div>
                            {member.fullName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {member.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {member.collegeRole.name}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
