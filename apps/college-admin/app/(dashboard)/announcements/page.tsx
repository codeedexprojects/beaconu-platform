"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Radio, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useSiteAnnouncements,
  useCreateSiteAnnouncement,
  useUpdateSiteAnnouncement,
  useDeleteSiteAnnouncement,
} from "@/hooks/use-site-announcements";
import type { SiteAnnouncementItem } from "@beaconu/types";

const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  date: z.string().trim().min(1, "Date is required"),
  link: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  highlighted: z.boolean().optional(),
});
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

const EMPTY_VALUES: AnnouncementFormValues = {
  title: "",
  date: "",
  link: "",
  highlighted: false,
};

function formatDateDisplay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SiteAnnouncementItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SiteAnnouncementItem | null>(
    null,
  );

  const { data: announcements, isLoading } = useSiteAnnouncements();
  const { mutate: create, isPending: isCreating } = useCreateSiteAnnouncement();
  const { mutate: update, isPending: isUpdating } = useUpdateSiteAnnouncement();
  const { mutate: remove, isPending: isDeleting } = useDeleteSiteAnnouncement();

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(item: SiteAnnouncementItem) {
    setEditing(item);
    form.reset({
      title: item.title,
      date: item.date.slice(0, 10),
      link: item.link ?? "",
      highlighted: item.highlighted,
    });
    setOpen(true);
  }

  function onSubmit(values: AnnouncementFormValues) {
    const payload = {
      title: values.title,
      date: values.date,
      link: values.link || null,
      highlighted: values.highlighted ?? false,
    };

    if (editing) {
      update(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Announcement updated");
            setOpen(false);
          },
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Announcement added");
          setOpen(false);
        },
      });
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    remove(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Announcement removed");
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-navy flex items-center gap-2">
            <Radio className="h-6 w-6" /> Site Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            Short dated updates shown in the scrolling ticker on your public
            landing page.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Announcement" : "Add Announcement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="UG Admission 2026-27 Phase 2 Allotment Published"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="link">Link (optional)</Label>
                <Input
                  id="link"
                  placeholder="https://..."
                  {...form.register("link")}
                />
                {form.formState.errors.link && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.link.message}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  {...form.register("highlighted")}
                />
                Highlight this announcement (shown in red)
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Date
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Title
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Highlighted
                </TableHead>
                <TableHead className="w-[140px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !announcements || announcements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No announcements yet.
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm text-muted-foreground">
                      {formatDateDisplay(item.date)}
                    </TableCell>
                    <TableCell className="py-4 text-sm font-medium">
                      {item.title}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={item.highlighted ? "default" : "secondary"}
                      >
                        {item.highlighted ? "Highlighted" : "Standard"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Announcement"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        variant="destructive"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
