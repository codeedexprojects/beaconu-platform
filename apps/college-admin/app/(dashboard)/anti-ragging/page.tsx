"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import {
  ShieldAlert,
  Eye,
  CheckCircle2,
  Search,
  Phone,
  Mail,
  Paperclip,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAntiRaggingComplaints,
  useAntiRaggingComplaint,
  useAcknowledgeComplaint,
  useStartInvestigationComplaint,
  useResolveComplaint,
} from "@/hooks/use-anti-ragging";
import type { AntiRaggingComplaintStatus, IncidentType } from "@beaconu/types";

const STATUS_LABELS: Record<AntiRaggingComplaintStatus, string> = {
  submitted: "Submitted",
  acknowledged: "Acknowledged",
  investigating: "Investigating",
  resolved: "Resolved",
};

const STATUS_VARIANT: Record<
  AntiRaggingComplaintStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  submitted: "destructive",
  acknowledged: "secondary",
  investigating: "secondary",
  resolved: "default",
};

const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  verbal: "Verbal",
  physical: "Physical",
  mental: "Mental",
  cyber: "Cyber",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN");
}

const resolveSchema = z.object({
  resolution: z
    .string()
    .trim()
    .min(1, "Resolution details are required")
    .max(5000, "Resolution must be under 5000 characters"),
});
type ResolveFormValues = z.infer<typeof resolveSchema>;

export default function AntiRaggingPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [incidentTypeFilter, setIncidentTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const resolveForm = useForm<ResolveFormValues>({
    resolver: zodResolver(resolveSchema),
    defaultValues: { resolution: "" },
  });

  useEffect(() => {
    if (!resolvingId) resolveForm.reset({ resolution: "" });
  }, [resolvingId, resolveForm]);

  const { data, isLoading } = useAntiRaggingComplaints({
    status: statusFilter || undefined,
    incident_type: incidentTypeFilter || undefined,
    search: search || undefined,
    page,
    limit: 20,
  });
  const { data: viewingComplaint } = useAntiRaggingComplaint(viewingId);
  const { mutate: acknowledge, isPending: isAcknowledging } =
    useAcknowledgeComplaint();
  const { mutate: startInvestigation, isPending: isStartingInvestigation } =
    useStartInvestigationComplaint();
  const { mutate: resolve, isPending: isResolving } = useResolveComplaint();

  function handleAcknowledge(complaintId: string) {
    acknowledge(complaintId, {
      onSuccess: () => toast.success("Report acknowledged"),
    });
  }

  function handleStartInvestigation(complaintId: string) {
    startInvestigation(complaintId, {
      onSuccess: () => toast.success("Investigation started"),
    });
  }

  function handleResolve(values: ResolveFormValues) {
    if (!resolvingId) return;
    resolve(
      { complaintId: resolvingId, data: { resolution: values.resolution } },
      {
        onSuccess: () => {
          toast.success("Report resolved");
          setResolvingId(null);
        },
      },
    );
  }

  const complaints = data?.complaints ?? [];
  const meta = data?.meta;

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Anti-Ragging Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Incident reports submitted by students — acknowledge, investigate, and
          resolve each case.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={incidentTypeFilter}
          onValueChange={(v) => {
            setIncidentTypeFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All incident types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All incident types</SelectItem>
            <SelectItem value="verbal">Verbal</SelectItem>
            <SelectItem value="physical">Physical</SelectItem>
            <SelectItem value="mental">Mental</SelectItem>
            <SelectItem value="cyber">Cyber</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-8"
            placeholder="Search subject or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Student
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Subject
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Type
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="w-[260px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : complaints.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-20 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ShieldAlert className="h-8 w-8 text-muted-foreground/50" />
                      <p>No anti-ragging reports yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">
                          {c.student?.fullName ?? c.studentId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.complaintNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] py-4">
                      <p className="truncate text-sm">{c.subject}</p>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {INCIDENT_TYPE_LABELS[c.incidentType]}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[c.status]}>
                        {STATUS_LABELS[c.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => setViewingId(c.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </Button>
                        {c.status === "submitted" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            disabled={isAcknowledging}
                            onClick={() => handleAcknowledge(c.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Acknowledge
                          </Button>
                        )}
                        {c.status === "acknowledged" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            disabled={isStartingInvestigation}
                            onClick={() => handleStartInvestigation(c.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Start Investigation
                          </Button>
                        )}
                        {c.status === "investigating" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-600"
                            disabled={isResolving}
                            onClick={() => setResolvingId(c.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {meta && meta.total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {Math.ceil(meta.total / 20)} · {meta.total}{" "}
            total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!viewingId} onOpenChange={(v) => !v && setViewingId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <div>
            <DialogHeader>
              <DialogTitle>Anti-Ragging Report Details</DialogTitle>
            </DialogHeader>
            {viewingComplaint && (
              <div className="divide-y text-sm">
                <div className="space-y-1.5 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Student · {viewingComplaint.complaintNumber}
                  </p>
                  <p className="text-base font-medium leading-snug">
                    {viewingComplaint.student?.fullName ??
                      viewingComplaint.studentId}
                  </p>
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    {viewingComplaint.student?.phoneNumber && (
                      <a
                        href={`tel:${viewingComplaint.student.phoneNumber}`}
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {viewingComplaint.student.phoneNumber}
                      </a>
                    )}
                    {viewingComplaint.student?.email && (
                      <a
                        href={`mailto:${viewingComplaint.student.email}`}
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {viewingComplaint.student.email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Incident
                  </p>
                  <p className="text-base font-medium leading-snug">
                    {viewingComplaint.subject}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {INCIDENT_TYPE_LABELS[viewingComplaint.incidentType]} ·{" "}
                    {viewingComplaint.incidentDate}
                    {viewingComplaint.incidentTime &&
                      ` at ${viewingComplaint.incidentTime}`}
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {viewingComplaint.description}
                  </p>
                </div>

                {viewingComplaint.individualsInvolved.length > 0 && (
                  <div className="space-y-2 py-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Individuals Involved
                    </p>
                    <ul className="space-y-2">
                      {viewingComplaint.individualsInvolved.map((person, i) => (
                        <li key={i} className="rounded-md border p-3">
                          <p className="font-medium">{person.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {[person.department, person.year, person.class]
                              .filter(Boolean)
                              .join(" · ") || "No additional details"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {viewingComplaint.attachments.length > 0 && (
                  <div className="space-y-2 py-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Evidence
                    </p>
                    <div className="flex flex-col gap-2">
                      {viewingComplaint.attachments.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5 shrink-0" />
                          {file.name ?? `Evidence ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <Badge variant={STATUS_VARIANT[viewingComplaint.status]}>
                    {STATUS_LABELS[viewingComplaint.status]}
                  </Badge>
                </div>

                {viewingComplaint.resolution && (
                  <div className="space-y-1.5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Resolution
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {viewingComplaint.resolution}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Case Progress
                  </p>
                  <ul className="space-y-1.5 border-l-2 pl-4 text-sm text-muted-foreground">
                    {viewingComplaint.statusHistory.map((h, i) => (
                      <li key={i}>
                        <span className="font-medium text-foreground">
                          {STATUS_LABELS[
                            h.status as AntiRaggingComplaintStatus
                          ] ?? h.status}
                        </span>{" "}
                        — {formatDateTime(h.changedAt)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={resolveForm.handleSubmit(handleResolve)}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-semibold">Resolve Report</h2>
            <div className="space-y-1">
              <Label>Resolution details</Label>
              <textarea
                rows={4}
                placeholder="Describe the action taken and outcome..."
                {...resolveForm.register("resolution")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {resolveForm.formState.errors.resolution && (
                <p className="text-sm text-destructive">
                  {resolveForm.formState.errors.resolution.message}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResolvingId(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isResolving}>
                {isResolving ? "Resolving..." : "Confirm Resolution"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
