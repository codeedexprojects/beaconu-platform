"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadService } from "@/lib/services/upload.service";
import type { PlatformTicketAttachmentItem } from "@beaconu/types";

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

interface TicketAttachmentsInputProps {
  value: PlatformTicketAttachmentItem[];
  onChange: (attachments: PlatformTicketAttachmentItem[]) => void;
  context: string;
}

export function TicketAttachmentsInput({
  value,
  onChange,
  context,
}: TicketAttachmentsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    if (value.length >= MAX_FILES) {
      toast.error(`You can attach up to ${MAX_FILES} files`);
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File must be under 10 MB");
      return;
    }
    if (!file.type) {
      toast.error("Selected file has no MIME type");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadUrl, key } = await uploadService.presign(
        file.type,
        file.size,
        context,
      );
      await uploadService.putToS3(uploadUrl, file);
      const { permanentUrl } = await uploadService.verify(key);
      onChange([
        ...value,
        {
          url: permanentUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
      ]);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={isUploading || value.length >= MAX_FILES}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Paperclip className="h-3.5 w-3.5" />
        )}
        {isUploading ? "Uploading…" : "Attach Document"}
      </Button>

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((att, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-sm"
            >
              {att.fileType.startsWith("image/") ? (
                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="flex-1 truncate">{att.fileName}</span>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onInputChange}
        disabled={isUploading || value.length >= MAX_FILES}
      />
    </div>
  );
}
