"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Paperclip, Pin, Plus, Search, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import {
  useNotices,
  useNotice,
  useCreateNotice,
  useUpdateNotice,
  useArchiveNotice,
  useRestoreNotice,
} from "@/hooks/use-notices";
import type {
  NoticeAttachmentItem,
  NoticeDetail,
  NoticeStatus,
} from "@beaconu/types";

const CATEGORIES = [
  "Administration",
  "Academics",
  "Student Life",
  "Events",
  "Other",
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function emptyForm() {
  return {
    title: "",
    content: "",
    category: "Administration",
    isPinned: false,
    requiredDocuments: [] as string[],
    attachments: [] as NoticeAttachmentItem[],
  };
}

export default function NoticesPage() {
  const [statusFilter, setStatusFilter] = useState<NoticeStatus>("published");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useNotices({
    status: statusFilter,
    search: search || undefined,
    page,
    limit,
  });
  const { mutate: createNotice, isPending: isCreating } = useCreateNotice();
  const { mutate: updateNotice, isPending: isUpdating } = useUpdateNotice();
  const { mutate: archiveNotice, isPending: isArchiving } = useArchiveNotice();
  const { mutate: restoreNotice, isPending: isRestoring } = useRestoreNotice();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [newDocument, setNewDocument] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<NoticeDetail | null>(null);

  const { data: editingDetail } = useNotice(editingId);

  const notices = data?.notices ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (editingDetail && editingDetail.id === editingId) {
      setForm({
        title: editingDetail.title,
        content: editingDetail.content,
        category: editingDetail.category || "Administration",
        isPinned: editingDetail.isPinned,
        requiredDocuments: editingDetail.requiredDocuments,
        attachments: editingDetail.attachments,
      });
    }
  }, [editingDetail, editingId]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(notice: (typeof notices)[number]) {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      content: notice.content,
      category: notice.category || "Administration",
      isPinned: notice.isPinned,
      requiredDocuments: [],
      attachments: [],
    });
    setDialogOpen(true);
  }

  function addDocument() {
    if (!newDocument.trim()) return;
    setForm((prev) => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, newDocument.trim()],
    }));
    setNewDocument("");
  }

  function removeDocument(idx: number) {
    setForm((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== idx),
    }));
  }

  async function handleAttachmentUpload(file: File | null) {
    if (!file) return;
    try {
      setUploadingAttachment(true);
      const url = await uploadCollegeAdminFile(file, "notices/attachments");
      setForm((prev) => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          {
            url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        ],
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingAttachment(false);
    }
  }

  function removeAttachment(idx: number) {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      is_pinned: form.isPinned,
      required_documents: form.requiredDocuments,
      attachments: form.attachments,
    };

    if (editingId) {
      updateNotice(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success("Notice updated");
            setDialogOpen(false);
          },
        },
      );
    } else {
      createNotice(payload, {
        onSuccess: () => {
          toast.success("Notice published");
          setDialogOpen(false);
        },
      });
    }
  }

  function confirmArchive() {
    if (!archiveTarget) return;
    archiveNotice(archiveTarget.id, {
      onSuccess: () => {
        toast.success("Notice archived");
        setArchiveTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notice Board</h1>
          <p className="text-sm text-muted-foreground">
            Publish updates and announcements students see in the Student Hub.
          </p>
        </div>
        <Button onClick={openCreate} className="shadow-lg shadow-primary/10">
          <Plus className="mr-2 h-4 w-4" /> New Notice
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as NoticeStatus);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-2 flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notices.length === 0 ? (
          <div className="col-span-2 text-center py-16 border border-dashed rounded-lg text-muted-foreground text-sm">
            No {statusFilter} notices yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="border rounded-2xl p-4 bg-card space-y-2 cursor-pointer hover:border-foreground/20"
              onClick={() => openEdit(notice)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{notice.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(notice.publishedAt)}
                  </span>
                </div>
                {notice.isPinned && (
                  <Pin className="h-4 w-4 text-primary fill-primary" />
                )}
              </div>
              <h3 className="font-bold text-sm">{notice.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notice.content}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Updated {formatDate(notice.updatedAt)}
                </span>
                {statusFilter === "published" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isArchiving}
                    onClick={(e) => {
                      e.stopPropagation();
                      setArchiveTarget(notice as NoticeDetail);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Archive
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isRestoring}
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreNotice(notice.id, {
                        onSuccess: () => toast.success("Notice restored"),
                      });
                    }}
                  >
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Notice" : "Publish New Notice"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Physical Reporting & Hard Copy Verification"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Content</Label>
              <Textarea
                rows={4}
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="Full notice details students will see..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is-pinned"
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={form.isPinned}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isPinned: e.target.checked }))
                }
              />
              <Label htmlFor="is-pinned" className="text-xs">
                Pin to top of Notice Board
              </Label>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-bold">
                Required Documents (optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Original 10th & 12th Marksheets"
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDocument();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addDocument}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.requiredDocuments.length > 0 && (
                <div className="space-y-1">
                  {form.requiredDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs"
                    >
                      <span>{doc}</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-bold">
                Attachments (optional)
              </Label>
              <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-xs text-muted-foreground cursor-pointer hover:border-foreground/30">
                {uploadingAttachment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
                Click to upload a file
                <input
                  type="file"
                  className="hidden"
                  disabled={uploadingAttachment}
                  onChange={(e) =>
                    handleAttachmentUpload(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              {form.attachments.length > 0 && (
                <div className="space-y-1">
                  {form.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs"
                    >
                      <span className="truncate">{att.fileName}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={
                isCreating ||
                isUpdating ||
                uploadingAttachment ||
                (editingId !== null && !editingDetail)
              }
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingId ? "Save Changes" : "Publish Notice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={archiveTarget !== null}
        title="Archive Notice"
        description={
          archiveTarget
            ? `Archive "${archiveTarget.title}"? Students will no longer see it on the Notice Board.`
            : ""
        }
        confirmLabel="Archive"
        variant="destructive"
        loading={isArchiving}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
      />
    </div>
  );
}
