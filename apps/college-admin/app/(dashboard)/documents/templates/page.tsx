"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Ban, CheckCircle2 } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDocumentTemplates,
  useCreateDocumentTemplate,
  useUpdateDocumentTemplate,
  useActivateDocumentTemplate,
  useDeactivateDocumentTemplate,
} from "@/hooks/use-documents";
import type { DocumentCategory, DocumentTemplateItem } from "@beaconu/types";

export const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "identification", label: "Identification" },
  { value: "financial", label: "Financial" },
  { value: "medical", label: "Medical" },
  { value: "administrative", label: "Administrative" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  academic: "Academic",
  identification: "Identification",
  financial: "Financial",
  medical: "Medical",
  administrative: "Administrative",
  other: "Other",
};

const templateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  category: z.enum(
    [
      "academic",
      "identification",
      "financial",
      "medical",
      "administrative",
      "other",
    ],
    { message: "Select a document category" },
  ),
  instructions: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(1000).optional(),
});
type TemplateForm = z.infer<typeof templateSchema>;

export default function DocumentTemplatesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentTemplateItem | null>(null);

  const { data: templates, isLoading } = useDocumentTemplates(true);
  const { mutate: create, isPending: isCreating } = useCreateDocumentTemplate();
  const { mutate: update, isPending: isUpdating } = useUpdateDocumentTemplate();
  const { mutate: activate } = useActivateDocumentTemplate();
  const { mutate: deactivate } = useDeactivateDocumentTemplate();

  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      category: undefined,
      instructions: "",
      description: "",
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      name: "",
      category: undefined,
      instructions: "",
      description: "",
    });
    setOpen(true);
  }

  function openEdit(template: DocumentTemplateItem) {
    setEditing(template);
    form.reset({
      name: template.name,
      category: template.category,
      instructions: template.instructions ?? "",
      description: template.description ?? "",
    });
    setOpen(true);
  }

  function onSubmit(values: TemplateForm) {
    if (editing) {
      update(
        { templateId: editing.id, data: values },
        {
          onSuccess: () => {
            toast.success("Document template updated");
            setOpen(false);
          },
        },
      );
    } else {
      create(values, {
        onSuccess: () => {
          toast.success("Document template created");
          setOpen(false);
        },
      });
    }
  }

  function toggleActive(template: DocumentTemplateItem) {
    if (template.isActive) {
      deactivate(template.id, {
        onSuccess: () => toast.success("Template deactivated"),
      });
    } else {
      activate(template.id, {
        onSuccess: () => toast.success("Template activated"),
      });
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/documents">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Requestable Document Types
          </h1>
          <p className="text-sm text-muted-foreground">
            Define which official documents students can request from your
            college (e.g. Bonafide Certificate, Transcript).
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
              Add Document Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Document Type" : "Add Document Type"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Bonafide Certificate"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.category && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="instructions">
                  Instructions{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <textarea
                  id="instructions"
                  rows={2}
                  placeholder="e.g. Submit a request at least 3 working days in advance"
                  {...form.register("instructions")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="What this document is for"
                  {...form.register("description")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
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

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Name
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Category
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="w-[160px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !templates || templates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No document types defined yet.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{t.name}</p>
                        {t.description && (
                          <p className="max-w-md truncate text-xs text-muted-foreground">
                            {t.description}
                          </p>
                        )}
                        {t.instructions && (
                          <p className="max-w-md truncate text-xs italic text-muted-foreground">
                            {t.instructions}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {CATEGORY_LABELS[t.category]}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={t.isActive ? "default" : "outline"}>
                        {t.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => toggleActive(t)}
                        >
                          {t.isActive ? (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
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
    </div>
  );
}
