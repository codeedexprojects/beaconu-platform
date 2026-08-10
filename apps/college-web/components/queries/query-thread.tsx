"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Headset,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store";
import { useSendTicketMessage, useTicketDetail } from "@/hooks/use-tickets";
import { uploadTicketAttachment } from "@/lib/services/ticket.service";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "./status-styles";
import type { TicketAttachmentItem } from "@beaconu/types";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface QueryThreadProps {
  ticketId: string;
  subdomain: string;
}

export function QueryThread({ ticketId, subdomain }: QueryThreadProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const { data: ticket, isLoading } = useTicketDetail(
    ticketId,
    Boolean(student),
  );
  const { mutate: send, isPending } = useSendTicketMessage(ticketId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [pendingAttachment, setPendingAttachment] =
    useState<TicketAttachmentItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta subdomain={subdomain} message="Sign in to view this query." />
    );
  }

  if (isLoading || !ticket) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  async function handleFileSelected(file: File | null) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`${file.name} is larger than 5MB`);
      return;
    }
    setIsUploading(true);
    try {
      const result = await uploadTicketAttachment(file);
      setPendingAttachment(result);
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : "Upload failed";
      toast.error(errMessage);
    } finally {
      setIsUploading(false);
    }
  }

  function handleSend() {
    if (!message.trim() && !pendingAttachment) return;
    send(
      {
        message: message.trim() || undefined,
        attachments: pendingAttachment ? [pendingAttachment] : undefined,
      },
      {
        onSuccess: () => {
          setMessage("");
          setPendingAttachment(null);
        },
      },
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-0">
        <Link
          href={`/college/${subdomain}/queries`}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-bold leading-tight">{ticket.subject}</h1>
          <p className="text-xs text-muted-foreground">
            #{ticket.ticketNumber.slice(-6).toUpperCase()}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_BADGE_CLASS[ticket.status]}>
          {STATUS_LABEL[ticket.status]}
        </Badge>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-0">
        {ticket.messages.map((msg) => {
          const isStudent = msg.senderType === "student";
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isStudent ? "items-end" : "items-start"}`}
            >
              {!isStudent ? (
                <div className="flex items-center gap-1.5 pl-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    <Headset className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.senderName}
                  </span>
                </div>
              ) : null}

              {msg.message ? (
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    isStudent
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground"
                  }`}
                >
                  {msg.message}
                </div>
              ) : null}

              {msg.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-sm ${
                    isStudent
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground"
                  }`}
                >
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 underline-offset-2 hover:underline"
                  >
                    {att.fileType.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{att.fileName}</span>
                  </a>
                </div>
              ))}

              <span className="px-1 text-[11px] text-muted-foreground">
                {formatTime(msg.createdAt)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border/60 px-4 py-3 sm:px-0">
        {isClosed ? (
          <p className="py-2 text-center text-xs text-muted-foreground">
            This query is closed. Submit a new query if you need further help.
          </p>
        ) : (
          <>
            {pendingAttachment ? (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs">
                    {pendingAttachment.fileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingAttachment(null)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) =>
                  handleFileSelected(e.target.files?.[0] ?? null)
                }
              />
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="h-11 flex-1 rounded-full border border-border/60 bg-background px-4 text-sm outline-none focus:border-foreground/30"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending || (!message.trim() && !pendingAttachment)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
