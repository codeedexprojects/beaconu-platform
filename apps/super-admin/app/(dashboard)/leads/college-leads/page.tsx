"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
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

import {
  useCollegeLeads,
  useCollegeLeadStats,
  useUpdateCollegeLeadStatus,
} from "@/hooks/use-college-leads";
import { CollegeLeadDetailModal } from "@/components/college-leads/college-lead-detail-modal";
import { CollegeLeadStatusModal } from "@/components/college-leads/college-lead-status-modal";
import { ProvisionSuccessModal } from "@/components/college-leads/provision-success-modal";
import type {
  CollegeLead,
  UpdateStatusResponse,
} from "@/lib/services/college-leads.service";

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" as const, icon: Clock },
  approved: {
    label: "Approved",
    variant: "success" as const,
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    variant: "destructive" as const,
    icon: XCircle,
  },
};

export default function CollegeLeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<CollegeLead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [provisionData, setProvisionData] = useState<
    UpdateStatusResponse["provisionedCollege"] | null
  >(null);

  // Data fetching with TanStack Query
  const { data: leadsData, isLoading: isLeadsLoading } = useCollegeLeads({
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const { data: stats, isLoading: isStatsLoading } = useCollegeLeadStats();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateCollegeLeadStatus();

  const leads = leadsData?.data ?? [];
  const isLoading = isLeadsLoading || isStatsLoading;

  const handleViewDetail = (lead: CollegeLead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const handleOpenStatusModal = (lead: CollegeLead) => {
    setSelectedLead(lead);
    setIsStatusOpen(true);
    setIsDetailOpen(false);
  };

  const handleUpdateStatus = (data: {
    status: string;
    review_remarks?: string;
    enableInstitutionGroup?: boolean;
  }) => {
    if (!selectedLead) return;
    updateStatus(
      {
        id: selectedLead.id,
        status: data.status,
        review_remarks: data.review_remarks,
        enableInstitutionGroup: data.enableInstitutionGroup,
      },
      {
        onSuccess: (response) => {
          setIsStatusOpen(false);
          setSelectedLead(null);
          toast.success("College lead status updated successfully");
          if (response.provisionedCollege) {
            setProvisionData(response.provisionedCollege);
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col min-h-full relative">
      <Header
        title="College Leads"
        description="Review and manage college onboarding requests from the landing page"
      />

      <div className="flex-1 space-y-4 p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Requests",
              value: stats?.total ?? 0,
              color: "primary",
              icon: Building2,
            },
            {
              label: "Pending",
              value: stats?.pending ?? 0,
              color: "amber",
              icon: Clock,
            },
            {
              label: "Approved",
              value: stats?.approved ?? 0,
              color: "emerald",
              icon: CheckCircle2,
            },
            {
              label: "Rejected",
              value: stats?.rejected ?? 0,
              color: "rose",
              icon: XCircle,
            },
          ].map((s) => (
            <Card
              key={s.label}
              className={`bg-${s.color === "primary" ? "primary" : s.color + "-500"}/5 border-${s.color === "primary" ? "primary" : s.color + "-500"}/10`}
            >
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {s.label}
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{s.value}</h3>
                  </div>
                  <div
                    className={`p-2 bg-${s.color === "primary" ? "primary" : s.color + "-500"}/10 rounded-lg`}
                  >
                    <s.icon
                      className={`h-5 w-5 ${s.color === "primary" ? "text-primary" : `text-${s.color}-600`}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by college, email, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(["", "pending", "approved", "rejected"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="capitalize"
              >
                {s === "" ? "All" : s}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading college leads...
                </p>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Building2 className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground font-medium">
                  No college leads found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[240px]">College</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const sc = STATUS_CONFIG[lead.status];
                    return (
                      <TableRow
                        key={lead.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {lead.collegeName}
                              </p>
                              {lead.universityName && (
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {lead.universityName}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {lead.contactPersonName}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Mail className="h-2.5 w-2.5" />
                              {lead.contactEmail}
                            </div>
                            {lead.contactPhone && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Phone className="h-2.5 w-2.5" />
                                {lead.contactPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.city || lead.state ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {[lead.city, lead.state]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={sc.variant}
                            className="capitalize gap-1 text-[10px]"
                          >
                            <sc.icon className="h-3 w-3" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(lead.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
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
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleViewDetail(lead)}
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleOpenStatusModal(lead)}
                                disabled={lead.status === "approved"}
                              >
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CollegeLeadDetailModal
        lead={selectedLead}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateStatus={handleOpenStatusModal}
      />

      <CollegeLeadStatusModal
        lead={selectedLead}
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onSubmit={handleUpdateStatus}
        isPending={isUpdating}
      />

      <ProvisionSuccessModal
        data={provisionData}
        isOpen={!!provisionData}
        onClose={() => setProvisionData(null)}
      />
    </div>
  );
}
