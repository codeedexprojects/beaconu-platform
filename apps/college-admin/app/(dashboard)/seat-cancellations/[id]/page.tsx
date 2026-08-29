"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lock,
  Loader2,
  MessageSquare,
  Pencil,
  Phone,
  Receipt,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api";
import { useStaffDirectory } from "@/hooks/use-roles";
import {
  useSeatCancellationCase,
  useReviewSeatCancellation,
  useSubmitSeatCancellationInitiation,
  useScheduleSeatCancellationCounseling,
  useSubmitSeatCancellationCounselingOutcome,
  useSubmitSeatCancellationSettlement,
  useFinalizeSeatCancellationClearance,
} from "@/hooks/use-seat-cancellations";
import type {
  SeatCancellationCaseType,
  SeatCancellationCounselingOutcome,
  SeatCancellationRefundMethod,
} from "@beaconu/types";

const CASE_META: Record<
  SeatCancellationCaseType,
  {
    label: string;
    title: string;
    sub: string;
    icon: typeof AlertTriangle;
  }
> = {
  A: {
    label: "Case A",
    title: "Penalty Applied",
    sub: "Standard withdrawal",
    icon: AlertTriangle,
  },
  B: {
    label: "Case B",
    title: "Refund Eligible",
    sub: "Transfer verified",
    icon: Building2,
  },
  C: {
    label: "Case C",
    title: "Standard Withdrawal",
    sub: "No refund",
    icon: FileText,
  },
};

const primaryButtonCls = "rounded-lg bg-navy text-white hover:bg-navy/90";

function initials(name: string | null, fallback: string) {
  const source = name?.trim() || fallback;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PhaseShell({
  phaseNumber,
  title,
  state,
  date,
  isLast,
  children,
}: {
  phaseNumber: number;
  title: string;
  state: "locked" | "active" | "completed";
  date?: string | null;
  isLast?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-cream",
            state === "completed" && "bg-emerald-500 text-white",
            state === "active" && "bg-gold text-white",
            state === "locked" && "bg-muted text-muted-foreground",
          )}
        >
          {state === "completed" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : state === "locked" ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <Pencil className="h-3.5 w-3.5" />
          )}
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <Card
        className={cn(
          "mb-5 flex-1 rounded-2xl border-border",
          state === "active" && "border-gold shadow-md",
          state === "locked" && "opacity-60",
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wide",
                  state === "completed" && "text-emerald-600",
                  state === "active" && "text-gold",
                  state === "locked" && "text-muted-foreground",
                )}
              >
                Phase {phaseNumber} ·{" "}
                {state === "completed"
                  ? "Completed"
                  : state === "active"
                    ? "In Progress"
                    : "Locked"}
              </p>
              <h3 className="font-serif text-lg font-bold text-navy">
                {title}
              </h3>
            </div>
            {date && (
              <span className="text-xs text-muted-foreground">
                {formatDate(date)}
              </span>
            )}
          </div>
          {state !== "locked" && children}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SeatCancellationCasePage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: request, isLoading } = useSeatCancellationCase(id ?? null);
  const { mutate: reject, isPending: isRejecting } =
    useReviewSeatCancellation();
  const { mutate: submitInitiation, isPending: isSubmittingInitiation } =
    useSubmitSeatCancellationInitiation(id as string);
  const { mutate: scheduleCounseling, isPending: isScheduling } =
    useScheduleSeatCancellationCounseling(id as string);
  const { mutate: submitOutcome, isPending: isSubmittingOutcome } =
    useSubmitSeatCancellationCounselingOutcome(id as string);
  const { mutate: submitSettlement, isPending: isSettling } =
    useSubmitSeatCancellationSettlement(id as string);
  const { mutate: finalizeClearance, isPending: isFinalizing } =
    useFinalizeSeatCancellationClearance(id as string);
  const { data: staff = [] } = useStaffDirectory();

  const [effectiveDate, setEffectiveDate] = useState("");
  const [lastSemester, setLastSemester] = useState("");
  const [counselorId, setCounselorId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [counselingNotes, setCounselingNotes] = useState("");
  const [outcome, setOutcome] =
    useState<SeatCancellationCounselingOutcome | null>(null);
  const [selectedCase, setSelectedCase] =
    useState<SeatCancellationCaseType | null>(null);
  const [refundMethod, setRefundMethod] =
    useState<SeatCancellationRefundMethod>("percentage");
  const [refundValue, setRefundValue] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [documentsHandedOver, setDocumentsHandedOver] = useState(false);
  const [refundTransactionRef, setRefundTransactionRef] = useState("");
  const [refundPaymentMethod, setRefundPaymentMethod] = useState("");

  if (isLoading || !request) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const isLegacy =
    request.status !== "pending" &&
    request.currentPhase === 1 &&
    !request.effectiveDate;

  function handleReject() {
    reject(
      {
        id: id as string,
        data: { decision: "reject", remarks: "Declined at initiation" },
      },
      {
        onSuccess: () => {
          toast.success("Cancellation request rejected");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  function handleConfirmInitiation() {
    if (!effectiveDate || !lastSemester.trim()) {
      toast.error("Effective date and last semester are required");
      return;
    }
    submitInitiation(
      { effective_date: effectiveDate, last_semester: lastSemester.trim() },
      { onSuccess: () => toast.success("Initiation recorded") },
    );
  }

  function handleConfirmSchedule() {
    if (!counselorId || !scheduleDate || !scheduleTime) {
      toast.error("Counselor, date, and time are required");
      return;
    }
    scheduleCounseling(
      {
        counselor_id: counselorId,
        scheduled_at: `${scheduleDate}T${scheduleTime}:00`,
      },
      { onSuccess: () => toast.success("Counseling scheduled") },
    );
  }

  function handleSubmitOutcome() {
    if (!outcome) {
      toast.error("Select a counseling outcome");
      return;
    }
    submitOutcome(
      { notes: counselingNotes.trim() || undefined, outcome },
      { onSuccess: () => toast.success("Counseling outcome submitted") },
    );
  }

  function handleProcessSettlement() {
    if (!selectedCase) {
      toast.error("Select a case");
      return;
    }
    if (selectedCase === "A") {
      if (!penaltyAmount) {
        toast.error("Enter the outstanding penalty amount");
        return;
      }
      submitSettlement(
        { case_type: "A", penalty_amount: Number(penaltyAmount) },
        { onSuccess: () => toast.success("Penalty payment recorded") },
      );
    } else if (selectedCase === "B") {
      if (!refundValue) {
        toast.error("Enter the refund calculation value");
        return;
      }
      submitSettlement(
        {
          case_type: "B",
          refund_calculation_method: refundMethod,
          refund_calculation_value: Number(refundValue),
        },
        { onSuccess: () => toast.success("Settlement processed") },
      );
    } else {
      submitSettlement(
        { case_type: "C" },
        { onSuccess: () => toast.success("Standard withdrawal confirmed") },
      );
    }
  }

  function handleFinalClearance() {
    if (!documentsHandedOver) {
      toast.error("Confirm all documents have been handed over");
      return;
    }
    if (request!.caseType === "B" && !refundTransactionRef.trim()) {
      toast.error("Refund transaction reference is required for Case B");
      return;
    }
    finalizeClearance(
      {
        refund_transaction_ref: refundTransactionRef.trim() || undefined,
        refund_payment_method: refundPaymentMethod.trim() || undefined,
      },
      { onSuccess: () => toast.success("Case cleared") },
    );
  }

  const phaseState = (phase: number): "locked" | "active" | "completed" =>
    request.currentPhase > phase ||
    (phase === 5 && !!request.documentsHandedOverAt)
      ? "completed"
      : request.currentPhase === phase
        ? "active"
        : "locked";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => router.push("/seat-cancellations")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Cancellation Case Details
        </h1>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border">
        <div className="h-1 w-full bg-gold" />
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-base font-semibold text-white">
              {initials(request.studentName, request.studentId)}
            </span>
            <div>
              <p className="font-serif text-lg font-bold text-navy">
                {request.studentName ?? request.studentId}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-gold">ID: {request.id}</span>{" "}
                · {request.courseName}
              </p>
              <Badge
                variant="outline"
                className="mt-1 gap-1 border-gold/40 bg-gold-pale text-[11px] font-medium text-navy"
              >
                <CalendarDays className="h-3 w-3" />
                Applied: {formatDate(request.requestedAt)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {request.status === "rejected" && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                Rejected
              </Badge>
            )}
            <a
              href={
                request.studentEmail
                  ? `mailto:${request.studentEmail}`
                  : undefined
              }
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted",
                !request.studentEmail && "pointer-events-none opacity-40",
              )}
            >
              <MessageSquare className="h-4 w-4" />
            </a>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground opacity-40">
              <Phone className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>

      {isLegacy ? (
        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Decision</span>
              <Badge variant="outline">{request.status}</Badge>
            </div>
            {request.remarks && (
              <div>
                <div className="text-muted-foreground">Remarks</div>
                <p>{request.remarks}</p>
              </div>
            )}
            {request.refundAmount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refund Amount</span>
                <span>₹{request.refundAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processed</span>
              <span>{formatDateTime(request.processedAt)}</span>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              This request was processed before the case-flow was introduced.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {/* Phase 1 — Initiation */}
          <PhaseShell
            phaseNumber={1}
            title="Initiation"
            state={phaseState(1)}
            date={phaseState(1) === "completed" ? request.requestedAt : null}
          >
            {phaseState(1) === "active" ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-gold-pale/60 p-3 text-sm">
                  <div className="text-muted-foreground mb-1">Reason</div>
                  <p>{request.reason}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Effective Date</Label>
                    <Input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Semester</Label>
                    <Input
                      placeholder="e.g. Sem 3"
                      value={lastSemester}
                      onChange={(e) => setLastSemester(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className={cn("flex-1", primaryButtonCls)}
                    disabled={isSubmittingInitiation}
                    onClick={handleConfirmInitiation}
                  >
                    {isSubmittingInitiation && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Confirm Initiation
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-lg"
                    disabled={isRejecting}
                    onClick={handleReject}
                  >
                    Reject Request
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 rounded-lg bg-gold-pale/60 p-3 text-sm sm:grid-cols-3">
                <div>
                  <div className="text-[11px] uppercase text-muted-foreground">
                    Reason
                  </div>
                  <p className="font-medium">{request.reason}</p>
                </div>
                <div>
                  <div className="text-[11px] uppercase text-muted-foreground">
                    Effective Date
                  </div>
                  <p className="font-medium">
                    {formatDate(request.effectiveDate)}
                  </p>
                </div>
                <div>
                  <div className="text-[11px] uppercase text-muted-foreground">
                    Last Semester
                  </div>
                  <p className="font-medium">{request.lastSemester ?? "—"}</p>
                </div>
              </div>
            )}
          </PhaseShell>

          {/* Phase 2 — Schedule Mandatory Counseling */}
          <PhaseShell
            phaseNumber={2}
            title={
              phaseState(2) === "completed"
                ? "Exit Counseling Schedule"
                : "Schedule Mandatory Counseling"
            }
            state={phaseState(2)}
          >
            {phaseState(2) === "active" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Counselor</Label>
                  <Select value={counselorId} onValueChange={setCounselorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff
                        .filter((s) => s.status === "active")
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Select Date</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Select Time</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className={cn("w-full", primaryButtonCls)}
                  disabled={isScheduling}
                  onClick={handleConfirmSchedule}
                >
                  {isScheduling && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Calendar className="h-4 w-4 mr-2" />
                  Confirm Schedule
                </Button>
              </div>
            ) : phaseState(2) === "completed" ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gold-pale/60 p-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gold shrink-0">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium">
                      Scheduled for {formatDateTime(request.scheduledAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      with {request.counselorName ?? "—"}
                    </p>
                  </div>
                </div>
                {request.meetingUrl ? (
                  <Button
                    asChild
                    size="sm"
                    className="gap-1.5 rounded-full bg-navy text-white hover:bg-navy/90"
                  >
                    <a
                      href={request.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Meeting
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No meeting link generated
                  </span>
                )}
              </div>
            ) : null}
          </PhaseShell>

          {/* Phase 3 — Counseling Summary & Path Determination */}
          <PhaseShell
            phaseNumber={3}
            title="Counseling Summary & Path Determination"
            state={phaseState(3)}
          >
            {phaseState(3) === "active" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Counseling Summary / Notes</Label>
                  <Textarea
                    rows={3}
                    value={counselingNotes}
                    onChange={(e) => setCounselingNotes(e.target.value)}
                    placeholder="Enter detailed counseling notes here..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Counseling Outcome</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(
                      [
                        {
                          value: "transfer",
                          label: "Student Intends to Transfer",
                        },
                        {
                          value: "termination",
                          label: "Student Opts for Termination",
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setOutcome(opt.value)}
                        className={cn(
                          "rounded-lg border p-3 text-left text-sm transition-colors",
                          outcome === opt.value
                            ? "border-gold bg-gold-pale/60 font-medium"
                            : "hover:border-gold/40",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  className={cn("w-full", primaryButtonCls)}
                  disabled={isSubmittingOutcome}
                  onClick={handleSubmitOutcome}
                >
                  {isSubmittingOutcome && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Counseling Outcome
                </Button>
              </div>
            ) : phaseState(3) === "completed" ? (
              <div className="space-y-2 text-sm">
                <div className="rounded-lg bg-gold-pale/60 p-3">
                  <div className="text-[11px] uppercase text-muted-foreground mb-1">
                    Counseling Outcome
                  </div>
                  <p>
                    {request.counselingOutcome === "transfer"
                      ? "Student Intends to Transfer"
                      : "Student Opts for Termination"}
                  </p>
                  {request.counselingNotes && (
                    <p className="mt-1 text-muted-foreground">
                      {request.counselingNotes}
                    </p>
                  )}
                </div>
                {request.suggestedCaseType && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-medium">
                        System Determination:{" "}
                      </span>
                      Student intends to transfer... triggers Case{" "}
                      {request.suggestedCaseType} refund policy.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </PhaseShell>

          {/* Phase 4 — Settlement Action */}
          <PhaseShell
            phaseNumber={4}
            title="Settlement Action"
            state={phaseState(4)}
          >
            {phaseState(4) === "active" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(Object.keys(CASE_META) as SeatCancellationCaseType[]).map(
                    (c) => {
                      const meta = CASE_META[c];
                      const Icon = meta.icon;
                      const isSelected = selectedCase === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedCase(c)}
                          className={cn(
                            "relative rounded-xl border p-3 text-left text-sm transition-colors",
                            isSelected
                              ? "border-gold bg-gold-pale/60"
                              : request.suggestedCaseType === c
                                ? "border-gold/40 bg-gold-pale/20"
                                : "hover:border-gold/40",
                          )}
                        >
                          {isSelected && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <Icon className="h-4 w-4 text-gold mb-1" />
                          <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                            {meta.label}
                          </p>
                          <p className="font-medium text-navy">{meta.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {meta.sub}
                          </p>
                        </button>
                      );
                    },
                  )}
                </div>

                {selectedCase === "A" && (
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs">Outstanding Penalty</Label>
                      <Input
                        type="number"
                        min={0}
                        value={penaltyAmount}
                        onChange={(e) => setPenaltyAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <Button
                      className={primaryButtonCls}
                      disabled={isSettling}
                      onClick={handleProcessSettlement}
                    >
                      {isSettling && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Record Penalty Payment
                    </Button>
                  </div>
                )}

                {selectedCase === "B" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Refund Calculation Method
                        </Label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setRefundMethod("percentage")}
                            className={cn(
                              "flex-1 rounded-md border px-3 py-2 text-sm",
                              refundMethod === "percentage"
                                ? "border-gold bg-gold-pale/60"
                                : "hover:border-gold/40",
                            )}
                          >
                            Percentage (%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRefundMethod("fixed")}
                            className={cn(
                              "flex-1 rounded-md border px-3 py-2 text-sm",
                              refundMethod === "fixed"
                                ? "border-gold bg-gold-pale/60"
                                : "hover:border-gold/40",
                            )}
                          >
                            Fixed Amount
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Enter Value</Label>
                        <Input
                          type="number"
                          min={0}
                          value={refundValue}
                          onChange={(e) => setRefundValue(e.target.value)}
                          placeholder={
                            refundMethod === "percentage"
                              ? "e.g. 10"
                              : "e.g. 5000"
                          }
                        />
                      </div>
                      <Button
                        disabled={isSettling}
                        onClick={handleProcessSettlement}
                        className={cn("self-end", primaryButtonCls)}
                      >
                        {isSettling && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Process Settlement
                      </Button>
                    </div>
                  </div>
                )}

                {selectedCase === "C" && (
                  <Button
                    className={cn("w-full", primaryButtonCls)}
                    disabled={isSettling}
                    onClick={handleProcessSettlement}
                  >
                    {isSettling && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Confirm Standard Withdrawal (No Refund)
                  </Button>
                )}
              </div>
            ) : phaseState(4) === "completed" ? (
              <div className="rounded-lg bg-gold-pale/60 p-3 text-sm">
                <div className="text-[11px] uppercase text-muted-foreground mb-1">
                  Selected Path
                </div>
                <p className="font-medium">
                  {request.caseType
                    ? `${CASE_META[request.caseType].label}: ${CASE_META[request.caseType].title}`
                    : "—"}
                </p>
                {request.caseType === "A" && request.penaltyAmount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Penalty: ₹{request.penaltyAmount}
                  </p>
                )}
                {request.caseType === "B" && request.refundAmount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Refund: ₹{request.refundAmount} (
                    {request.refundCalculationMethod === "percentage"
                      ? `${request.refundCalculationValue}%`
                      : `flat ₹${request.refundCalculationValue}`}
                    )
                  </p>
                )}
              </div>
            ) : null}
          </PhaseShell>

          {/* Phase 5 — Final Clearance */}
          <PhaseShell
            phaseNumber={5}
            title="Final Clearance"
            state={phaseState(5)}
            isLast
          >
            {phaseState(5) === "active" ? (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={documentsHandedOver}
                    onChange={(e) => setDocumentsHandedOver(e.target.checked)}
                  />
                  All documents handed over
                </label>
                {request.caseType === "B" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Refund Transaction ID</Label>
                      <Input
                        value={refundTransactionRef}
                        onChange={(e) =>
                          setRefundTransactionRef(e.target.value)
                        }
                        placeholder="e.g. REF-2023-892-01"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Payment Method</Label>
                      <Input
                        value={refundPaymentMethod}
                        onChange={(e) => setRefundPaymentMethod(e.target.value)}
                        placeholder="e.g. Bank Transfer (Bank of India)"
                      />
                    </div>
                  </div>
                )}
                <Button
                  className={cn("w-full", primaryButtonCls)}
                  disabled={isFinalizing}
                  onClick={handleFinalClearance}
                >
                  {isFinalizing && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Confirm Final Clearance
                </Button>
              </div>
            ) : phaseState(5) === "completed" ? (
              <div className="space-y-3 text-sm">
                <p className="italic text-muted-foreground">
                  All original documents verified and returned to student.
                </p>
                {request.caseType === "B" && (
                  <div className="rounded-lg border bg-gold-pale/40 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                      Refund Transaction Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Transaction ID
                        </div>
                        <p className="font-medium">
                          {request.refundTransactionRef ?? "—"}
                        </p>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Amount
                        </div>
                        <p className="font-medium">
                          ₹{request.refundAmount ?? "—"}
                        </p>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Method
                        </div>
                        <p className="font-medium">
                          {request.refundPaymentMethod ?? "—"}
                        </p>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Status
                        </div>
                        <p className="flex items-center gap-1 font-medium text-emerald-600">
                          <Receipt className="h-3.5 w-3.5" />
                          Processed on {formatDate(request.refundProcessedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {request.caseType === "A" && request.penaltyAmount && (
                  <div className="flex items-center gap-2 rounded-lg border bg-gold-pale/40 p-3">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <p>
                      Penalty of ₹{request.penaltyAmount} recorded as paid on{" "}
                      {formatDate(request.penaltyPaidAt)}.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </PhaseShell>
        </div>
      )}
    </div>
  );
}
