"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, PencilLine, Save, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useLegalDocuments,
  useSaveLegalDocument,
  useSetLegalDocumentStatus,
} from "@/hooks/use-legal-documents";
import type { CollegeLegalDocumentSlot } from "@beaconu/types";

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DocumentEditor({
  slot,
  onClose,
}: {
  slot: CollegeLegalDocumentSlot;
  onClose: () => void;
}) {
  const doc = slot.document;
  const { mutate: save, isPending: isSaving } = useSaveLegalDocument();
  const { mutate: setStatus, isPending: isUpdatingStatus } =
    useSetLegalDocumentStatus();

  const [title, setTitle] = useState(doc?.title ?? slot.label);
  const [content, setContent] = useState(doc?.content ?? "");
  const [documentUrl, setDocumentUrl] = useState(doc?.documentUrl ?? "");
  const [effectiveFrom, setEffectiveFrom] = useState(doc?.effectiveFrom ?? "");
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  useEffect(() => {
    setTitle(doc?.title ?? slot.label);
    setContent(doc?.content ?? "");
    setDocumentUrl(doc?.documentUrl ?? "");
    setEffectiveFrom(doc?.effectiveFrom ?? "");
  }, [doc, slot.label]);

  function persist(status?: "draft" | "published") {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    save(
      {
        docType: slot.docType,
        payload: {
          title: title.trim(),
          content: content.trim(),
          document_url: documentUrl.trim() || null,
          effective_from: effectiveFrom || null,
          ...(status ? { status } : {}),
        },
      },
      {
        onSuccess: () =>
          toast.success(
            status === "published"
              ? `${slot.label} published`
              : `${slot.label} saved`,
          ),
      },
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-base font-bold text-navy">
            {slot.label}
          </h2>
          <p className="text-xs text-muted-foreground">
            {doc
              ? `v${doc.version} · last updated ${formatDateTime(doc.updatedAt)}`
              : "Not created yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              doc?.status === "published"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }
          >
            {doc?.status === "published" ? "Published" : "Draft"}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${slot.docType}-title`}>Title</Label>
          <Input
            id={`${slot.docType}-title`}
            value={title}
            maxLength={150}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${slot.docType}-effective`}>
            Effective From{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id={`${slot.docType}-effective`}
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${slot.docType}-content`}>Content</Label>
        <p className="text-xs text-muted-foreground">
          Plain text or HTML (&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt;).
          Shown as-is to students on your college site and in the app.
        </p>
        <Textarea
          id={`${slot.docType}-content`}
          rows={14}
          className="resize-y font-mono text-xs"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"<h2>1. Introduction</h2>\n<p>…</p>"}
        />
      </div>

      <FileUpload
        label="PDF copy (optional)"
        context="legal-documents"
        value={documentUrl}
        onChange={setDocumentUrl}
      />

      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        {doc?.status === "published" && (
          <Button
            type="button"
            variant="outline"
            disabled={isUpdatingStatus}
            onClick={() => setConfirmUnpublish(true)}
          >
            Unpublish
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={isSaving}
          onClick={() => persist()}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Save draft
        </Button>
        <Button
          type="button"
          className="gap-2"
          disabled={isSaving}
          onClick={() => persist("published")}
        >
          <CheckCircle2 className="h-4 w-4" />
          {doc?.status === "published" ? "Save & publish" : "Publish"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmUnpublish}
        title={`Unpublish ${slot.label}?`}
        description="Students will no longer see it until you publish it again."
        confirmLabel="Unpublish"
        variant="destructive"
        loading={isUpdatingStatus}
        onCancel={() => setConfirmUnpublish(false)}
        onConfirm={() =>
          setStatus(
            { docType: slot.docType, status: "draft" },
            {
              onSuccess: () => {
                toast.success(`${slot.label} unpublished`);
                setConfirmUnpublish(false);
              },
            },
          )
        }
      />
    </div>
  );
}

export default function CollegeLegalDocumentsPage() {
  const { data, isLoading, error } = useLegalDocuments();
  const [openType, setOpenType] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Policies & Legal
        </h1>
        <p className="text-sm text-muted-foreground">
          Your college&apos;s privacy policy, terms and payment policies, shown
          to students alongside BeaconU&apos;s platform policies.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Couldn&apos;t load policies. Please try again.
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((slot) =>
            openType === slot.docType ? (
              <DocumentEditor
                key={slot.docType}
                slot={slot}
                onClose={() => setOpenType(null)}
              />
            ) : (
              <Card key={slot.docType} className="rounded-2xl border-border">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-pale text-gold">
                      <Scale className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-navy">{slot.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.document
                          ? `v${slot.document.version} · last updated ${formatDateTime(slot.document.updatedAt)}`
                          : "Not created yet"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        slot.document?.status === "published"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {slot.document?.status === "published"
                        ? "Published"
                        : "Draft"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setOpenType(slot.docType)}
                    >
                      <PencilLine className="h-4 w-4" />
                      {slot.document ? "Edit" : "Create"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
