"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTicket } from "@/hooks/use-tickets";
import { uploadTicketAttachment } from "@/lib/services/ticket.service";
import { formatTicketDate } from "./status-styles";
import type { TicketAttachmentItem, TicketDetail } from "@beaconu/types";

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const DESCRIPTION_MAX = 500;

interface DraftAttachment {
  key: string;
  fileName: string;
  status: "uploading" | "done" | "error";
  result?: TicketAttachmentItem;
}

interface SubmitQueryFormProps {
  collegeId: string;
  subdomain: string;
}

const inputCls =
  "h-11 w-full rounded-xl border border-border/60 bg-background px-3.5 text-sm outline-none focus:border-foreground/30";

export function SubmitQueryForm({
  collegeId,
  subdomain,
}: SubmitQueryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: create, isPending } = useCreateTicket();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const [submitted, setSubmitted] = useState<TicketDetail | null>(null);

  const isUploading = attachments.some((a) => a.status === "uploading");

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} files`);
      return;
    }

    const toProcess = Array.from(files).slice(0, remaining);
    for (const file of toProcess) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }
      const draftKey = `${file.name}-${Date.now()}-${Math.random()}`;
      setAttachments((prev) => [
        ...prev,
        { key: draftKey, fileName: file.name, status: "uploading" },
      ]);
      try {
        const result = await uploadTicketAttachment(file);
        setAttachments((prev) =>
          prev.map((a) =>
            a.key === draftKey ? { ...a, status: "done", result } : a,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(message);
        setAttachments((prev) =>
          prev.map((a) => (a.key === draftKey ? { ...a, status: "error" } : a)),
        );
      }
    }
  }

  function removeAttachment(key: string) {
    setAttachments((prev) => prev.filter((a) => a.key !== key));
  }

  function handleSubmit() {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe your query");
      return;
    }
    if (isUploading) {
      toast.error("Please wait for attachments to finish uploading");
      return;
    }

    create(
      {
        college_id: collegeId,
        subject: subject.trim(),
        description: description.trim(),
        attachments: attachments
          .filter((a) => a.status === "done" && a.result)
          .map((a) => a.result as TicketAttachmentItem),
      },
      {
        onSuccess: (ticket) => {
          setSubmitted(ticket);
        },
      },
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center sm:px-0">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </span>
        <h1 className="mt-4 text-xl font-bold">
          Query Submitted Successfully!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your query has been received and assigned a unique ID:{" "}
          <span className="font-medium text-foreground">
            #{submitted.ticketNumber.slice(-6).toUpperCase()}
          </span>
          . A support agent will respond to you shortly.
        </p>

        <div className="mt-6 rounded-2xl border border-border/60 p-5 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="flex items-center gap-1.5 text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Awaiting Review
            </span>
          </div>
          <div className="mt-4 border-t border-border/60 pt-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold">{submitted.subject}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Submitted on {formatTicketDate(submitted.createdAt)}
          </p>

          {submitted.messages[0]?.message ? (
            <div className="mt-4 border-t border-border/60 pt-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Description
              </p>
              <p className="mt-1 text-sm text-foreground">
                {submitted.messages[0].message}
              </p>
            </div>
          ) : null}

          {submitted.messages[0]?.attachments.length ? (
            <div className="mt-4 border-t border-border/60 pt-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Attached Evidence
              </p>
              <div className="mt-2 space-y-2">
                {submitted.messages[0].attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2"
                  >
                    {att.fileType.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs">{att.fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <Button
          className="mt-6 h-11 w-full"
          onClick={() => router.push(`/college/${subdomain}/queries`)}
        >
          Go to My Queries
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:px-0">
      <div className="space-y-4 rounded-2xl border border-border/60 p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Subject</label>
          <input
            className={inputCls}
            placeholder="e.g., Issue with portal login"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Description</label>
            <span className="text-xs text-muted-foreground">
              {description.length}/{DESCRIPTION_MAX}
            </span>
          </div>
          <textarea
            rows={5}
            maxLength={DESCRIPTION_MAX}
            className={`${inputCls} h-auto py-2.5`}
            placeholder="Please provide detailed information about your query so we can assist you better..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            Attach Evidence{" "}
            <span className="text-muted-foreground">(Optional)</span>
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 py-8 text-center transition-colors hover:border-foreground/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Paperclip className="h-4 w-4 text-primary" />
            </span>
            <span className="text-sm font-medium">
              Tap to upload photos or documents
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, PDF (Max 5MB)
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          {attachments.length > 0 ? (
            <div className="mt-2 space-y-2">
              {attachments.map((a) => (
                <div
                  key={a.key}
                  className="flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {a.status === "uploading" ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-xs">{a.fileName}</span>
                    {a.status === "error" ? (
                      <span className="shrink-0 text-xs text-destructive">
                        Failed
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(a.key)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Button
          className="h-12 w-full"
          onClick={handleSubmit}
          disabled={isPending || isUploading}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit Query
        </Button>
        <Button
          variant="ghost"
          className="h-12 w-full"
          onClick={() => router.push(`/college/${subdomain}/queries`)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
