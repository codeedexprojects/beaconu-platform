"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileText,
  Loader2,
  PencilLine,
  Save,
  Scale,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useLegalDocuments,
  useSaveLegalDocument,
  useSetLegalDocumentStatus,
} from "@/hooks/use-legal-documents";
import type { LegalDocumentSlot } from "@beaconu/types";

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

function DocumentEditor({ slot }: { slot: LegalDocumentSlot }) {
  const doc = slot.document;
  const { mutate: save, isPending: isSaving } = useSaveLegalDocument();
  const { mutate: setStatus, isPending: isUpdatingStatus } =
    useSetLegalDocumentStatus();

  const [title, setTitle] = useState(doc?.title ?? slot.label);
  const [content, setContent] = useState(doc?.content ?? "");
  const [documentUrl, setDocumentUrl] = useState(doc?.documentUrl ?? "");
  const [effectiveFrom, setEffectiveFrom] = useState(doc?.effectiveFrom ?? "");
  const [unpublishTarget, setUnpublishTarget] = useState(false);

  // Re-seed the form when the saved document changes (after a save or a
  // publish) so the fields reflect what is actually stored.
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
    <Card className="border-none shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Scale className="h-5 w-5 text-muted-foreground" />
            </span>
            <div>
              <h2 className="text-base font-semibold">{slot.label}</h2>
              <p className="text-xs text-muted-foreground">
                {doc
                  ? `v${doc.version} · last updated ${formatDateTime(doc.updatedAt)}`
                  : "Not created yet"}
              </p>
            </div>
          </div>
          <Badge variant={doc?.status === "published" ? "success" : "warning"}>
            {doc?.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${slot.docType}-title`}>Title</Label>
            <Input
              id={`${slot.docType}-title`}
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor={`${slot.docType}-content`}>Content</Label>
          <p className="text-xs text-muted-foreground">
            Plain text or HTML (&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt;).
            Shown as-is in the app and website.
          </p>
          <Textarea
            id={`${slot.docType}-content`}
            rows={14}
            className="resize-y font-mono text-xs"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`<h2>1. Introduction</h2>\n<p>…</p>`}
          />
        </div>

        <FileUpload
          label="PDF copy (optional)"
          context="legal-documents"
          value={documentUrl}
          onChange={setDocumentUrl}
        />

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          {doc?.status === "published" ? (
            <Button
              type="button"
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={() => setUnpublishTarget(true)}
            >
              Unpublish
            </Button>
          ) : null}
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
      </CardContent>

      <ConfirmDialog
        open={unpublishTarget}
        title={`Unpublish ${slot.label}?`}
        description="It will stop appearing in the app and on the website until you publish it again."
        confirmLabel="Unpublish"
        variant="destructive"
        loading={isUpdatingStatus}
        onCancel={() => setUnpublishTarget(false)}
        onConfirm={() =>
          setStatus(
            { docType: slot.docType, status: "draft" },
            {
              onSuccess: () => {
                toast.success(`${slot.label} unpublished`);
                setUnpublishTarget(false);
              },
            },
          )
        }
      />
    </Card>
  );
}

export default function LegalDocumentsPage() {
  const { data, isLoading, error } = useLegalDocuments();
  const [openType, setOpenType] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Legal & Policies"
        description="Terms, privacy and payment policies shown in the app and on the website"
      />

      <div className="flex-1 space-y-4 p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
            <FileText className="mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              Couldn&apos;t load documents
            </h3>
            <p className="text-sm text-muted-foreground">
              Something went wrong. Please try again.
            </p>
          </div>
        ) : (
          (data ?? []).map((slot) =>
            openType === slot.docType ? (
              <div key={slot.docType} className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenType(null)}
                >
                  Close
                </Button>
                <DocumentEditor slot={slot} />
              </div>
            ) : (
              <Card key={slot.docType} className="border-none shadow-sm">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Scale className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="font-semibold">{slot.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.document
                          ? `v${slot.document.version} · last updated ${formatDateTime(slot.document.updatedAt)}`
                          : "Not created yet"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        slot.document?.status === "published"
                          ? "success"
                          : "warning"
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
          )
        )}
      </div>
    </div>
  );
}
