"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Ban } from "lucide-react";

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
  useAssessmentTemplate,
  useAssessmentSlots,
  useCreateAssessmentSlot,
  useUpdateAssessmentSlot,
  useCancelAssessmentSlot,
} from "@/hooks/use-assessments";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { AssessmentSlotItem, SlotType } from "@beaconu/types";

const slotSchema = z
  .object({
    slot_type: z.enum(["window", "fixed"]),
    window_start: z.string().trim().min(1, "Start is required"),
    window_end: z.string().trim().min(1, "End is required"),
    max_capacity: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.window_end > data.window_start, {
    message: "End must be after start",
    path: ["window_end"],
  });
type SlotFormValues = z.infer<typeof slotSchema>;

const EMPTY_VALUES: SlotFormValues = {
  slot_type: "window",
  window_start: "",
  window_end: "",
  max_capacity: undefined,
};

const STATUS_VARIANT: Record<
  AssessmentSlotItem["status"],
  "default" | "outline" | "secondary"
> = {
  active: "default",
  cancelled: "secondary",
};

function toDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AssessmentSlotsPage() {
  const params = useParams<{ id: string }>();
  const templateId = params.id;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AssessmentSlotItem | null>(null);
  const [cancelling, setCancelling] = useState<AssessmentSlotItem | null>(null);

  const { data: template } = useAssessmentTemplate(templateId);
  const { data: slots, isLoading } = useAssessmentSlots(templateId);
  const { mutate: create, isPending: isCreating } =
    useCreateAssessmentSlot(templateId);
  const { mutate: update, isPending: isUpdating } =
    useUpdateAssessmentSlot(templateId);
  const { mutate: cancel, isPending: isCancelling } =
    useCancelAssessmentSlot(templateId);

  const form = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(slot: AssessmentSlotItem) {
    setEditing(slot);
    form.reset({
      slot_type: slot.slotType,
      window_start: toDatetimeLocal(slot.windowStart),
      window_end: toDatetimeLocal(slot.windowEnd),
      max_capacity: slot.maxCapacity ?? undefined,
    });
    setOpen(true);
  }

  function onSubmit(values: SlotFormValues) {
    const payload = {
      slot_type: values.slot_type,
      window_start: new Date(values.window_start).toISOString(),
      window_end: new Date(values.window_end).toISOString(),
      max_capacity: values.max_capacity,
    };

    if (editing) {
      update(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Slot updated");
            setOpen(false);
          },
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Slot created");
          setOpen(false);
        },
      });
    }
  }

  function confirmCancel() {
    if (!cancelling) return;
    cancel(cancelling.id, {
      onSuccess: () => {
        toast.success("Slot cancelled");
        setCancelling(null);
      },
    });
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/assessments/templates">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {template?.name ?? "Template"} — Slots
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule window-based or fixed slots students can take this
            assessment in.
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
              Add Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Slot" : "Add Slot"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="slot_type">Slot Type</Label>
                <Select
                  value={form.watch("slot_type")}
                  onValueChange={(v) =>
                    form.setValue("slot_type", v as SlotType)
                  }
                >
                  <SelectTrigger id="slot_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="window">
                      Window (start anytime within range)
                    </SelectItem>
                    <SelectItem value="fixed">
                      Fixed (specific time slot)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="window_start">Starts At</Label>
                  <Input
                    id="window_start"
                    type="datetime-local"
                    {...form.register("window_start")}
                  />
                  {form.formState.errors.window_start && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.window_start.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="window_end">Ends At</Label>
                  <Input
                    id="window_end"
                    type="datetime-local"
                    {...form.register("window_end")}
                  />
                  {form.formState.errors.window_end && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.window_end.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max_capacity">
                  Max Capacity{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="max_capacity"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  {...form.register("max_capacity")}
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
                  Type
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Starts
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Ends
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Capacity
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
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
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !slots || slots.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No slots scheduled yet.
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((slot) => (
                  <TableRow
                    key={slot.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm capitalize">
                      {slot.slotType}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDateTime(slot.windowStart)}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDateTime(slot.windowEnd)}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {slot.maxCapacity ?? "Unlimited"}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[slot.status]}>
                        {slot.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      {slot.status === "active" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => openEdit(slot)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                            onClick={() => setCancelling(slot)}
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(v) => !v && setCancelling(null)}
        title="Cancel slot?"
        description="Students will no longer be able to be scheduled into this slot. This can't be undone from here."
        confirmLabel="Cancel Slot"
        onConfirm={confirmCancel}
        isPending={isCancelling}
      />
    </div>
  );
}
