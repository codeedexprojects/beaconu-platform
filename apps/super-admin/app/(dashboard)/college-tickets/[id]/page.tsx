"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronUp,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  Phone,
  PhoneCall,
  School,
  Send,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  useReplyToCollegeTicket,
  useUpdateCollegeTicketStatus,
} from "@/hooks/use-college-tickets";
import { collegeTicketsService } from "@/lib/services/college-tickets.service";
import { TicketAttachmentsInput } from "@/components/ticket-attachments-input";
import type {
  PlatformTicketAttachmentItem,
  PlatformTicketMessageItem,
  PlatformTicketStatus,
} from "@beaconu/types";

const STATUS_LABELS: Record<PlatformTicketStatus, string> = {
  in_progress: "In Progress",
  awaiting_response: "Awaiting Response",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
};

const MANUAL_STATUS_OPTIONS: { label: string; value: PlatformTicketStatus }[] =
  [
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
    { label: "Reopened", value: "reopened" },
  ];

const STATUS_BADGE_CLASS: Record<PlatformTicketStatus, string> = {
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

export default function CollegeTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: ticket, isLoading } = useCollegeTicket(ticketId ?? null);
  const { mutate: reply, isPending: isReplying } = useReplyToCollegeTicket(
    ticketId as string,
  );
  const { mutate: setStatus, isPending: isUpdatingStatus } =
    useUpdateCollegeTicketStatus(ticketId as string);

  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<
    PlatformTicketAttachmentItem[]
  >([]);
  const [olderMessages, setOlderMessages] = useState<
    PlatformTicketMessageItem[]
  >([]);
  const [oldestPageLoaded, setOldestPageLoaded] = useState<number | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  useEffect(() => {
    setOlderMessages([]);
    setOldestPageLoaded(null);
  }, [ticketId, ticket?.messagesMeta.total]);

  if (isLoading || !ticket) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isClosed = ticket.status === "closed";
  const canSend = !!message.trim() || attachments.length > 0;
  const currentOldestPage = oldestPageLoaded ?? ticket.messagesMeta.page;
  const hasOlderMessages = currentOldestPage > 1;
  const allMessages = [...olderMessages, ...ticket.messages];

  async function handleLoadOlder() {
    if (!hasOlderMessages || isLoadingOlder) return;
    setIsLoadingOlder(true);
    try {
      const previousPage = currentOldestPage - 1;
      const older = await collegeTicketsService.getById(
        ticketId as string,
        previousPage,
      );
      setOlderMessages((prev) => [...older.messages, ...prev]);
      setOldestPageLoaded(previousPage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoadingOlder(false);
    }
  }

  function handleSend() {
    if (!canSend) return;
    reply(
      {
        message: message.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
      {
        onSuccess: () => {
          setMessage("");
          setAttachments([]);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  function handleStatusChange(value: string) {
    setStatus(
      { status: value as PlatformTicketStatus },
      { onSuccess: () => toast.success("Status updated") },
    );
  }

  const isCallRequest = ticket.type === "call_request";

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={ticket.subject}
        description={`#${ticket.ticketNumber.slice(-6).toUpperCase()}`}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/college-tickets")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Header>

      <div className="flex-1 p-6 flex flex-col gap-4 min-h-0">
        {isCallRequest && ticket.phoneNumber && (
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    Call Back Requested
                  </p>
                  <p className="text-xl font-bold text-emerald-900">
                    {ticket.phoneNumber}
                  </p>
                  {ticket.preferredTime && (
                    <p className="flex items-center gap-1.5 text-sm text-emerald-700 mt-0.5">
                      <Clock className="h-3.5 w-3.5" />
                      Preferred time: {ticket.preferredTime}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <a href={`tel:${ticket.phoneNumber}`}>
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                </Button>
                {ticket.status !== "resolved" && ticket.status !== "closed" && (
                  <Button
                    variant="outline"
                    className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange("resolved")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark as Called
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <School className="h-4 w-4" />
            Submitted {formatDateTime(ticket.createdAt)}
          </div>
          <Select
            value={ticket.status}
            onValueChange={handleStatusChange}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="w-48 bg-background">
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

        <div className="max-h-[50vh] space-y-4 overflow-y-auto rounded-lg border bg-background p-4">
          {hasOlderMessages && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={isLoadingOlder}
                onClick={handleLoadOlder}
              >
                {isLoadingOlder ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
                {isLoadingOlder ? "Loading…" : "Load older messages"}
              </Button>
            </div>
          )}

          {allMessages.map((msg) => {
            const isAdmin = msg.senderType === "platform_admin";
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}
              >
                <span
                  className={`text-xs font-medium text-muted-foreground ${isAdmin ? "pr-1" : "pl-1"}`}
                >
                  {msg.senderName}
                </span>

                {msg.message ? (
                  <div
                    className={`max-w-[70%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm ${
                      isAdmin
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
                      isAdmin
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
          <div className="space-y-2">
            <TicketAttachmentsInput
              value={attachments}
              onChange={setAttachments}
              context="college-tickets"
            />
            <div className="flex items-end gap-2">
              <Textarea
                placeholder={
                  isCallRequest
                    ? "Add a note about the call (optional)..."
                    : "Type your reply..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[44px] flex-1 bg-background"
                rows={2}
              />
              <Button onClick={handleSend} disabled={isReplying || !canSend}>
                {isReplying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
