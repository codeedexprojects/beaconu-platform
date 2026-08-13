"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Headset,
  Image as ImageIcon,
  Loader2,
  Send,
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
import type { TicketStatus } from "@beaconu/types";

// All 5 statuses, for display (badge label lookup). "in_progress" and
// "awaiting_response" are set automatically based on who last replied —
// only "resolved"/"closed"/"reopened" are ever manually selectable below.
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

  function handleSend() {
    if (!message.trim()) return;
    reply(
      { message: message.trim() },
      {
        onSuccess: () => {
          setMessage("");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  }

  function handleStatusChange(value: string) {
    setStatus(
      { status: value as TicketStatus },
      {
        onSuccess: () => {
          toast.success("Status updated");
        },
      },
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col space-y-4">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/support")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{ticket.subject}</h1>
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

      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border p-4">
        {ticket.messages.map((msg) => {
          const isStaff = msg.senderType === "staff";
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isStaff ? "items-end" : "items-start"}`}
            >
              {!isStaff ? (
                <span className="pl-1 text-xs font-medium text-muted-foreground">
                  {msg.senderName}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 pr-1">
                  <span className="text-xs text-muted-foreground">
                    {msg.senderName}
                  </span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Headset className="h-3 w-3 text-primary" />
                  </span>
                </div>
              )}

              {msg.message ? (
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    isStaff
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
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
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
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
            placeholder="Type your reply..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[44px] flex-1"
            rows={2}
          />
          <Button onClick={handleSend} disabled={isReplying || !message.trim()}>
            {isReplying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
