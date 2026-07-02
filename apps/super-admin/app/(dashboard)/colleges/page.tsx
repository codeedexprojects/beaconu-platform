"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  X,
  Copy,
  Network,
} from "lucide-react";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useColleges,
  useCollegeStats,
  useUpdateCollegeListing,
} from "@/hooks/use-colleges";
import {
  useInstitutionGroup,
  useEnableInstitutionGroup,
  useDisableInstitutionGroup,
} from "@/hooks/use-institution-groups";
import type { CollegeSummary } from "@/lib/services/colleges.service";
import { getCollegeLink } from "@/lib/college-url";

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

// ── Institution Group Modal ─────────────────────────────────────────────

function InstitutionGroupModal({
  college,
  onClose,
}: {
  college: CollegeSummary;
  onClose: () => void;
}) {
  const [groupName, setGroupName] = useState(college.name + " Group");
  const [groupDescription, setGroupDescription] = useState("");

  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const { data: group, isLoading, refetch } = useInstitutionGroup(college.id);

  const enableMutation = useEnableInstitutionGroup();
  const disableMutation = useDisableInstitutionGroup();

  const hasGroup = !!group && group.status === "active";
  const hasInactiveGroup = !!group && group.status === "inactive";

  const handleEnable = () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    enableMutation.mutate(
      {
        collegeId: college.id,
        data: {
          name: groupName.trim(),
          description: groupDescription.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Institution group enabled!");
          refetch();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to enable group",
          );
        },
      },
    );
  };

  const handleDisable = () => setShowDisableConfirm(true);

  const confirmDisable = () => {
    disableMutation.mutate(college.id, {
      onSuccess: () => {
        toast.success("Institution group disabled");
        setShowDisableConfirm(false);
        refetch();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to disable group",
        );
        setShowDisableConfirm(false);
      },
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Group code copied!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-none">
                Institution Group
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {college.name}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasGroup ? (
            /* ── Group is ACTIVE ──────────────────────────── */
            <>
              {/* Group Code */}
              <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Group Code
                  </Label>
                  <Badge variant="default" className="bg-emerald-600 text-xs">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xl font-bold font-mono tracking-widest text-emerald-800 dark:text-emerald-300">
                    {group.groupCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => copyCode(group.groupCode)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with affiliated colleges so they can join this
                  group.
                </p>
              </div>

              {/* Group Info */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium">{group.name}</p>
                {group.description && (
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
              </div>

              {/* Member List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Member Colleges ({group.members?.length ?? 0})
                  </Label>
                </div>
                {group.members && group.members.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          {member.college.logoUrl ? (
                            <img
                              src={member.college.logoUrl}
                              alt={member.college.name}
                              className="h-6 w-6 rounded object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium leading-none">
                              {member.college.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {member.college.code} ·{" "}
                              {[member.college.city, member.college.state]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            member.role === "admin" ? "default" : "secondary"
                          }
                          className="text-[10px] capitalize"
                        >
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                    No colleges have joined yet. Share the group code above.
                  </p>
                )}
              </div>

              {/* Disable Button / Inline Confirm */}
              <div className="pt-2 border-t">
                {showDisableConfirm ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-3">
                    <p className="text-sm font-medium text-destructive">
                      Disable this group?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      New colleges won&apos;t be able to join using the code.
                      You can reactivate it later.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowDisableConfirm(false)}
                        disabled={disableMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={confirmDisable}
                        disabled={disableMutation.isPending}
                      >
                        {disableMutation.isPending && (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        )}
                        Yes, disable
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisable}
                    className="w-full"
                  >
                    Disable Institution Group
                  </Button>
                )}
              </div>
            </>
          ) : (
            /* ── Group NOT active (create or reactivate) ──── */
            <div className="space-y-4">
              {hasInactiveGroup && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    This college had an institution group that was disabled. You
                    can reactivate it below.
                  </p>
                </div>
              )}

              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Network className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Enable Institution Group</p>
                    <p className="text-xs text-muted-foreground">
                      A unique code will be generated for affiliated colleges to
                      join.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="group-name" className="text-sm">
                      Group Name
                    </Label>
                    <Input
                      id="group-name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Delhi University Group"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="group-desc" className="text-sm">
                      Description{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Textarea
                      id="group-desc"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Brief description of this institution group..."
                      rows={2}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleEnable}
                  disabled={enableMutation.isPending || !groupName.trim()}
                >
                  {enableMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Network className="h-4 w-4 mr-2" />
                  )}
                  {hasInactiveGroup
                    ? "Reactivate Group"
                    : "Enable & Generate Code"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────

export default function CollegesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selectedCollege, setSelectedCollege] = useState<CollegeSummary | null>(
    null,
  );

  // getCollegeLink is imported from @/lib/college-url

  const { data: stats } = useCollegeStats();
  const {
    data: result,
    isLoading,
    error,
  } = useColleges({ search, status, page, limit: 20 });

  const { mutate: updateListing, isPending: isUpdatingListing } =
    useUpdateCollegeListing();

  const colleges = result?.data ?? [];
  const meta = result?.meta;

  function handleToggleListing(college: CollegeSummary, isListed: boolean) {
    updateListing(
      { collegeId: college.id, isListed },
      {
        onSuccess: () => {
          toast.success(
            isListed
              ? "College is now publicly listed"
              : "College removed from public listing",
          );
        },
      },
    );
  }

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
                    <TableHead className="text-center">
                      Public Listing
                    </TableHead>
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
                      <TableRow
                        key={college.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/colleges/${college.id}`)}
                      >
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

                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Switch
                            checked={college.isListed}
                            disabled={isUpdatingListing}
                            onCheckedChange={(checked) =>
                              handleToggleListing(college, checked)
                            }
                          />
                        </TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => setSelectedCollege(college)}
                          >
                            <Network className="h-3 w-3" />
                            Group
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

      {/* Institution Group Modal */}
      {selectedCollege && (
        <InstitutionGroupModal
          college={selectedCollege}
          onClose={() => setSelectedCollege(null)}
        />
      )}
    </div>
  );
}
