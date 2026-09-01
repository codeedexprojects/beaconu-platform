"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Circle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/api";
import {
  useCollegeTicket,
  useReplyToTicket,
  useUpdateTicketStatus,
} from "@/hooks/use-support-tickets";
import type { ApplicantStatusStep, TicketStatus } from "@beaconu/types";

const STATUS_LABELS: Record<TicketStatus, string> = {
  in_progress: "In Progress",
  awaiting_response: "Awaiting Response",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
};

const MANUAL_STATUS_OPTIONS: { label: string; value: TicketStatus }[] = [
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
  { label: "Reopened", value: "reopened" },
];

const STATUS_BADGE_CLASS: Record<TicketStatus, string> = {
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  awaiting_response: "bg-red-50 text-red-700 border-red-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-blue-50 text-blue-700 border-blue-200",
  reopened: "bg-amber-50 text-amber-700 border-amber-200",
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function StatusStepRow({
  label,
  step,
}: {
  label: string;
  step: ApplicantStatusStep;
}) {
  const Icon =
    step.status === "completed"
      ? Check
      : step.status === "scheduled" || step.status === "in_progress"
        ? Circle
        : Circle;
  const iconClass =
    step.status === "completed"
      ? "bg-emerald-500 text-white"
      : step.status === "scheduled" || step.status === "in_progress"
        ? "border-2 border-gold text-gold"
        : "border-2 border-border text-muted-foreground";
  const label2 =
    step.status === "completed"
      ? "Completed"
      : step.status === "scheduled"
        ? (step.detail ?? "Scheduled")
        : step.status === "in_progress"
          ? "In Progress"
          : step.status === "not_required"
            ? "Not Required"
            : "Pending";

  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconClass}`}
      >
        {step.status === "completed" ? (
          <Check className="h-3 w-3" />
        ) : (
          <Icon className="h-2 w-2 fill-current" />
        )}
      </span>
      <div>
        <p className="text-sm font-semibold text-navy">{label}</p>
        <p className="text-xs text-gold">{label2}</p>
      </div>
    </div>
  );
}

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: ticket, isLoading } = useCollegeTicket(ticketId ?? null);
  const { mutate: reply, isPending: isReplying } = useReplyToTicket(
    ticketId as string,
  );
  const { mutate: setStatus, isPending: isUpdatingStatus } =
    useUpdateTicketStatus(ticketId as string);

  const [message, setMessage] = useState("");

  if (isLoading || !ticket) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isClosed = ticket.status === "closed";
  const applicant = ticket.applicantStatus;
  const originalQuery = ticket.messages[0];
  const studentName =
    ticket.messages.find((m) => m.senderType === "student")?.senderName ??
    "Student";

  function handleSend() {
    if (!message.trim()) return;
    reply(
      { message: message.trim() },
      {
        onSuccess: () => setMessage(""),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  function handleStatusChange(value: string) {
    setStatus(
      { status: value as TicketStatus },
      { onSuccess: () => toast.success("Status updated") },
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/support")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-serif text-xl font-bold text-navy">
            {ticket.subject}
          </h1>
          <p className="text-sm text-muted-foreground">
            #{ticket.ticketNumber.slice(-6).toUpperCase()} · Submitted{" "}
            {formatDateTime(ticket.createdAt)}
          </p>
        </div>
        <Select
          value={ticket.status}
          onValueChange={handleStatusChange}
          disabled={isUpdatingStatus}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              <Badge
                variant="outline"
                className={STATUS_BADGE_CLASS[ticket.status]}
              >
                {STATUS_LABELS[ticket.status]}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MANUAL_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-white p-4">
            {ticket.messages.map((msg) => {
              const isStaff = msg.senderType === "staff";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${isStaff ? "items-end" : "items-start"}`}
                >
                  <span className="px-1 text-xs font-medium text-muted-foreground">
                    {msg.senderName}
                  </span>
                  {msg.message ? (
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        isStaff
                          ? "rounded-tr-sm bg-navy text-white"
                          : "rounded-tl-sm bg-muted text-foreground"
                      }`}
                    >
                      {msg.message}
                    </div>
                  ) : null}
                  {msg.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex max-w-[70%] items-center gap-2 rounded-2xl px-3 py-2.5 text-sm underline-offset-2 hover:underline ${
                        isStaff
                          ? "rounded-tr-sm bg-navy text-white"
                          : "rounded-tl-sm bg-muted text-foreground"
                      }`}
                    >
                      {att.fileType.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">{att.fileName}</span>
                    </a>
                  ))}
                  <span className="px-1 text-[11px] text-muted-foreground">
                    {formatDateTime(msg.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>

          {isClosed ? (
            <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
              This query is closed. Reopen it (via the status dropdown above) to
              reply.
            </p>
          ) : (
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[44px] flex-1 rounded-2xl"
                rows={2}
              />
              <Button
                className="rounded-full bg-gold text-navy hover:bg-gold/90"
                size="icon"
                onClick={handleSend}
                disabled={isReplying || !message.trim()}
              >
                {isReplying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4 overflow-y-auto">
          <div className="rounded-2xl border border-border bg-white p-6 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-pale font-serif text-xl font-bold text-gold ring-2 ring-gold">
              {initials(studentName)}
            </span>
            <p className="mt-3 font-serif text-lg font-bold text-navy">
              {studentName}
            </p>
            {applicant && (
              <p className="font-mono text-xs text-muted-foreground">
                ID: #{applicant.applicationNumber}
              </p>
            )}
          </div>

          {applicant?.programName && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Applied Program
              </p>
              <p className="font-serif text-base font-bold text-navy">
                {applicant.programName}
              </p>
            </div>
          )}

          {originalQuery && (
            <div className="rounded-2xl border border-gold/40 bg-gold-pale/30 p-5">
              <p className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-gold">
                Original Query
                <span className="font-normal normal-case text-muted-foreground">
                  {formatDateTime(originalQuery.createdAt)}
                </span>
              </p>
              <p className="text-sm italic text-navy">
                &quot;{originalQuery.message}&quot;
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Applicant Status
            </p>
            {applicant ? (
              <div className="space-y-4">
                <StatusStepRow
                  label="Application"
                  step={applicant.application}
                />
                <StatusStepRow label="Assessment" step={applicant.assessment} />
                <StatusStepRow label="Interview" step={applicant.interview} />
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                No application found for this student at this college.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
