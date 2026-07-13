"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { Percent, Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useCollegeQuotas,
  useCreateQuota,
  useUpdateQuota,
  useDeleteQuota,
} from "@/hooks/use-quotas";
import type { QuotaDto } from "@/lib/services/colleges.service";

const quotaFormSchema = z.object({
  name: z.string().trim().min(1, "Quota name is required").max(100),
  bucketType: z.enum(["in_state", "out_of_state"]),
  description: z.string().trim().max(2000).optional().default(""),
  sortOrder: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => v === "" || Number.isInteger(Number(v)), {
      message: "Sort order must be a whole number",
    }),
});

type QuotaFormData = z.infer<typeof quotaFormSchema>;

const DEFAULT_VALUES: QuotaFormData = {
  name: "",
  bucketType: "in_state",
  description: "",
  sortOrder: "",
};

const BUCKET_LABELS: Record<QuotaDto["bucketType"], string> = {
  in_state: "In-State",
  out_of_state: "Out-of-State",
};

export default function QuotasPage() {
  const { data: quotas, isLoading, error } = useCollegeQuotas();
  const { mutate: createQuota, isPending: isCreating } = useCreateQuota();
  const { mutate: updateQuota, isPending: isUpdating } = useUpdateQuota();
  const { mutate: deleteQuota, isPending: isDeleting } = useDeleteQuota();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuota, setEditingQuota] = useState<QuotaDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuotaDto | null>(null);

  const form = useForm<QuotaFormData>({
    resolver: zodResolver(quotaFormSchema as any),
    defaultValues: DEFAULT_VALUES,
  });

  const isPending = isCreating || isUpdating;

  function openCreate() {
    setEditingQuota(null);
    form.reset(DEFAULT_VALUES);
    setDialogOpen(true);
  }

  function openEdit(quota: QuotaDto) {
    setEditingQuota(quota);
    form.reset({
      name: quota.name,
      bucketType: quota.bucketType,
      description: quota.description ?? "",
      sortOrder: String(quota.sortOrder),
    });
    setDialogOpen(true);
  }

  function onSubmit(data: QuotaFormData) {
    const payload = {
      name: data.name,
      bucketType: data.bucketType,
      description: data.description || null,
      ...(data.sortOrder !== "" ? { sortOrder: Number(data.sortOrder) } : {}),
    };

    if (editingQuota) {
      updateQuota(
        { id: editingQuota.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Quota updated");
            setDialogOpen(false);
          },
        },
      );
    } else {
      createQuota(payload, {
        onSuccess: () => {
          toast.success("Quota created");
          setDialogOpen(false);
        },
      });
    }
  }

  function handleToggleActive(quota: QuotaDto) {
    updateQuota(
      { id: quota.id, data: { isActive: !quota.isActive } },
      {
        onSuccess: () => {
          toast.success(
            quota.isActive ? "Quota deactivated" : "Quota activated",
          );
        },
      },
    );
  }

  function handleDelete(quota: QuotaDto) {
    if (quota.usage.courseCount > 0 || quota.usage.seatPoolCount > 0) {
      toast.error(
        "This quota is used by courses or seat pools. Deactivate it instead.",
      );
      return;
    }
    setDeleteTarget(quota);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteQuota(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Quota removed");
        setDeleteTarget(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">
          Could not load the quota catalogue. Please try again.
        </p>
      </div>
    );
  }

  const rows = quotas ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Percent className="h-6 w-6" /> Quota Catalogue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            College-level quota categories. Courses pick from this catalogue and
            configure per-course fee reductions; seat pools are allocated per
            quota per admission cycle.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Quota
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quotas ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
              No quotas yet. Click &quot;Add Quota&quot; to create your first
              quota category (e.g. Government Quota, Management Quota, NRI
              Quota).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Bucket</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Courses</TableHead>
                    <TableHead className="text-center">Seat Pools</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((quota) => (
                    <TableRow
                      key={quota.id}
                      className={quota.isActive ? "" : "opacity-60"}
                    >
                      <TableCell>
                        <div className="font-medium">{quota.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {quota.slug}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            quota.bucketType === "in_state"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {BUCKET_LABELS[quota.bucketType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {quota.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {quota.usage.courseCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {quota.usage.seatPoolCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(quota)}
                          title={
                            quota.isActive
                              ? "Click to deactivate"
                              : "Click to activate"
                          }
                        >
                          <Badge
                            variant={quota.isActive ? "default" : "outline"}
                            className="cursor-pointer"
                          >
                            {quota.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(quota)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(quota)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingQuota ? "Edit Quota" : "Add Quota"}
            </DialogTitle>
            <DialogDescription>
              {editingQuota
                ? "Update this quota category. The slug changes if you rename it."
                : "Create a college-level quota category. Courses will select from this catalogue."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="quota-name">Name</Label>
              <Input
                id="quota-name"
                placeholder="e.g. Government Quota"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Bucket</Label>
              <Select
                value={form.watch("bucketType")}
                onValueChange={(value) =>
                  form.setValue(
                    "bucketType",
                    value as QuotaFormData["bucketType"],
                    { shouldDirty: true },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bucket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_state">
                    In-State (same state of domicile)
                  </SelectItem>
                  <SelectItem value="out_of_state">
                    Out-of-State (other Indian states)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Students only see quotas matching their state-of-domicile
                bucket. Foreign applicants see no quotas.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="quota-description">Description</Label>
              <Textarea
                id="quota-description"
                rows={3}
                placeholder="Who is this quota for and how are seats filled?"
                {...form.register("description")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="quota-sort">Sort Order</Label>
              <Input
                id="quota-sort"
                type="number"
                min={0}
                placeholder="0"
                {...form.register("sortOrder")}
              />
              {form.formState.errors.sortOrder && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.sortOrder.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingQuota ? "Save Changes" : "Create Quota"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Quota"
        description={
          deleteTarget
            ? `Remove the quota "${deleteTarget.name}"? This cannot be undone.`
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
