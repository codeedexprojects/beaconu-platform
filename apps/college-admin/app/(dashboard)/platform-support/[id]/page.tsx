"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronUp,
  Clock,
  FileText,
  Headset,
  Image as ImageIcon,
  Loader2,
  PhoneCall,
  PhoneIncoming,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api";
import {
  usePlatformTicket,
  useReplyToPlatformTicket,
} from "@/hooks/use-platform-tickets";
import { getPlatformTicket } from "@/lib/services/platform-tickets.service";
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

export default function PlatformTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: ticket, isLoading } = usePlatformTicket(ticketId ?? null);
  const { mutate: reply, isPending: isReplying } = useReplyToPlatformTicket(
    ticketId as string,
  );

  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<
    PlatformTicketAttachmentItem[]
  >([]);
  const [olderMessages, setOlderMessages] = useState<
    PlatformTicketMessageItem[]
  >([]);
  const [oldestPageLoaded, setOldestPageLoaded] = useState<number | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  // A fresh ticket (or a refetch after sending a message) always starts back
  // at the latest page — drop any previously-loaded older pages so they
  // don't get duplicated/misordered against the new latest-page data.
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
  const isCallRequest = ticket.type === "call_request";
  const callDone = ticket.status === "resolved" || ticket.status === "closed";
  const canSend = !!message.trim() || attachments.length > 0;
  const currentOldestPage = oldestPageLoaded ?? ticket.messagesMeta.page;
  const hasOlderMessages = currentOldestPage > 1;
  const allMessages = [...olderMessages, ...ticket.messages];

  async function handleLoadOlder() {
    if (!hasOlderMessages || isLoadingOlder) return;
    setIsLoadingOlder(true);
    try {
      const previousPage = currentOldestPage - 1;
      const older = await getPlatformTicket(ticketId as string, previousPage);
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
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/platform-support")}
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
        <Badge variant="outline" className={STATUS_BADGE_CLASS[ticket.status]}>
          {STATUS_LABELS[ticket.status]}
        </Badge>
      </div>

      {isCallRequest && ticket.phoneNumber && (
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
              {callDone ? (
                <PhoneCall className="h-5 w-5" />
              ) : (
                <PhoneIncoming className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                {callDone ? "Call Completed" : "Call Back Requested"}
              </p>
              <p className="text-sm text-emerald-900">
                {callDone
                  ? "BeaconU support has marked this call as done."
                  : `BeaconU support will call you at ${ticket.phoneNumber}.`}
              </p>
              {ticket.preferredTime && (
                <p className="flex items-center gap-1.5 text-sm text-emerald-700 mt-0.5">
                  <Clock className="h-3.5 w-3.5" />
                  Your preferred time: {ticket.preferredTime}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-h-[55vh] space-y-4 overflow-y-auto rounded-lg border p-4">
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
              className={`flex flex-col gap-1 ${isAdmin ? "items-start" : "items-end"}`}
            >
              {isAdmin ? (
                <div className="flex items-center gap-1.5 pl-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Headset className="h-3 w-3 text-primary" />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.senderName}
                  </span>
                </div>
              ) : (
                <span className="pr-1 text-xs font-medium text-muted-foreground">
                  {msg.senderName}
                </span>
              )}

              {msg.message ? (
                <div
                  className={`max-w-[70%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm ${
                    isAdmin
                      ? "rounded-tl-sm bg-muted text-foreground"
                      : "rounded-tr-sm bg-primary text-primary-foreground"
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
                      ? "rounded-tl-sm bg-muted text-foreground"
                      : "rounded-tr-sm bg-primary text-primary-foreground"
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
          This query is closed. Submit a new query if you need further help.
        </p>
      ) : (
        <div className="space-y-2">
          <TicketAttachmentsInput
            value={attachments}
            onChange={setAttachments}
            context="platform-tickets"
          />
          <div className="flex items-end gap-2">
            <Textarea
              placeholder={
                isCallRequest
                  ? "Add more context for the call (optional)..."
                  : "Type your message..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[44px] flex-1"
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
  );
}
