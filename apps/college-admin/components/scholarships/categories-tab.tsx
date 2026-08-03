"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, X } from "lucide-react";

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
  useScholarshipConfigs,
  useCreateScholarshipConfig,
  useUpdateScholarshipConfig,
} from "@/hooks/use-scholarships";
import type { ScholarshipConfigItem } from "@beaconu/types";

const configSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  scholarship_type: z.string().trim().min(1, "Type is required"),
  discount_type: z.enum(["flat", "percentage"]),
  discount_value: z.coerce.number().positive("Must be greater than 0"),
});
type ConfigFormValues = z.infer<typeof configSchema>;

const EMPTY_VALUES: ConfigFormValues = {
  name: "",
  scholarship_type: "",
  discount_type: "percentage",
  discount_value: 0,
};

export function ScholarshipCategoriesTab() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScholarshipConfigItem | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [newDocName, setNewDocName] = useState("");

  const { data: configs, isLoading } = useScholarshipConfigs();
  const { mutate: create, isPending: isCreating } =
    useCreateScholarshipConfig();
  const { mutate: update, isPending: isUpdating } =
    useUpdateScholarshipConfig();

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setRequiredDocuments([]);
    setOpen(true);
  }

  function openEdit(item: ScholarshipConfigItem) {
    setEditing(item);
    form.reset({
      name: item.name,
      scholarship_type: item.scholarshipType,
      discount_type: item.discountType,
      discount_value: Number(item.discountValue),
    });
    setRequiredDocuments(item.requiredDocuments);
    setOpen(true);
  }

  function addDocument() {
    const value = newDocName.trim();
    if (!value) return;
    setRequiredDocuments((prev) => [...prev, value]);
    setNewDocName("");
  }

  function removeDocument(index: number) {
    setRequiredDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values: ConfigFormValues) {
    if (requiredDocuments.length === 0) {
      toast.error("Add at least one required supporting document");
      return;
    }

    const payload = {
      name: values.name,
      scholarship_type: values.scholarship_type,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      required_documents: requiredDocuments,
    };

    if (editing) {
      update(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Scholarship updated");
            setOpen(false);
          },
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Scholarship created");
          setOpen(false);
        },
      });
    }
  }

  function toggleActive(item: ScholarshipConfigItem) {
    update(
      { id: item.id, data: { is_active: !item.isActive } },
      {
        onSuccess: () =>
          toast.success(item.isActive ? "Deactivated" : "Activated"),
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Scholarship categories students can optionally apply for once
          shortlisted.
        </p>
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
              Add Scholarship
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Scholarship" : "Add Scholarship"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Merit Scholarship"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="scholarship_type">Type</Label>
                <Input
                  id="scholarship_type"
                  placeholder="merit, need_based, sports..."
                  {...form.register("scholarship_type")}
                />
                {form.formState.errors.scholarship_type && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.scholarship_type.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={form.watch("discount_type")}
                    onValueChange={(v) =>
                      form.setValue(
                        "discount_type",
                        v as ConfigFormValues["discount_type"],
                      )
                    }
                  >
                    <SelectTrigger id="discount_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="flat">Flat Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="discount_value">
                    {form.watch("discount_type") === "percentage"
                      ? "Discount %"
                      : "Discount Amount"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    {...form.register("discount_value")}
                  />
                  {form.formState.errors.discount_value && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.discount_value.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>
                  Required Supporting Documents{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Document names a student must attach when applying (e.g.
                  &quot;Income Certificate&quot;) — not files, just the
                  checklist. At least one is required.
                </p>
                <div className="space-y-2">
                  {requiredDocuments.map((docName, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <p className="flex-1 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        {docName}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeDocument(i)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder="e.g. Income Certificate"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDocument();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={addDocument}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
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

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Name
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Type
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Discount
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Required Documents
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
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !configs || configs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No scholarships created yet.
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.scholarshipType}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.discountType === "percentage"
                        ? `${item.discountValue}%`
                        : `₹${item.discountValue}`}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.requiredDocuments.length > 0
                        ? item.requiredDocuments.join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
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
                          className="h-8 text-xs"
                          onClick={() => toggleActive(item)}
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
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
