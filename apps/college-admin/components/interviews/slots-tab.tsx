"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Ban } from "lucide-react";

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
  useInterviewSlots,
  useCreateInterviewSlot,
  useUpdateInterviewSlot,
  useCancelInterviewSlot,
  useInterviewSettings,
} from "@/hooks/use-interviews";
import { useCollegeCampuses } from "@/hooks/use-colleges";
import type { InterviewMode, InterviewSlotItem } from "@beaconu/types";

const slotSchema = z
  .object({
    mode: z.enum(["gmeet", "on_campus"]),
    scheduled_date: z.string().trim().min(1, "Date is required"),
    start_time: z.string().trim().min(1, "Start time is required"),
    end_time: z.string().trim().min(1, "End time is required"),
    campus_id: z.string().trim().optional(),
    venue: z.string().trim().optional(),
    interviewer_email: z
      .union([z.string().trim().email(), z.literal("")])
      .optional(),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  })
  .refine((data) => data.mode !== "gmeet" || !!data.interviewer_email, {
    message: "Interviewer email is required for Google Meet slots",
    path: ["interviewer_email"],
  });
type SlotFormValues = z.infer<typeof slotSchema>;

const EMPTY_VALUES: SlotFormValues = {
  mode: "gmeet",
  scheduled_date: "",
  start_time: "",
  end_time: "",
  campus_id: undefined,
  venue: "",
  interviewer_email: "",
};

const STATUS_VARIANT: Record<
  InterviewSlotItem["status"],
  "default" | "secondary"
> = {
  active: "default",
  cancelled: "secondary",
};

const MODE_LABELS: Record<InterviewMode, string> = {
  gmeet: "Google Meet",
  on_campus: "On Campus",
};

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function InterviewSlotsTab() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InterviewSlotItem | null>(null);

  const { data: slots, isLoading } = useInterviewSlots();
  const { data: settings } = useInterviewSettings();
  const { data: campuses } = useCollegeCampuses();
  const { mutate: create, isPending: isCreating } = useCreateInterviewSlot();
  const { mutate: update, isPending: isUpdating } = useUpdateInterviewSlot();
  const {
    mutate: cancel,
    isPending: isCancelling,
    variables: cancelVars,
  } = useCancelInterviewSlot();

  const form = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema),
    defaultValues: EMPTY_VALUES,
  });
  const mode = form.watch("mode");

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(slot: InterviewSlotItem) {
    setEditing(slot);
    form.reset({
      mode: slot.mode,
      scheduled_date: slot.scheduledDate,
      start_time: slot.startTime,
      end_time: slot.endTime,
      campus_id: slot.campus?.id,
      venue: slot.venue ?? "",
      interviewer_email: slot.interviewerEmail ?? "",
    });
    setOpen(true);
  }

  function onSubmit(values: SlotFormValues) {
    const payload = {
      mode: values.mode,
      scheduled_date: values.scheduled_date,
      start_time: values.start_time,
      end_time: values.end_time,
      campus_id: values.mode === "on_campus" ? values.campus_id : undefined,
      venue: values.mode === "on_campus" ? values.venue : undefined,
      interviewer_email: values.interviewer_email || undefined,
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

  function handleCancel(slot: InterviewSlotItem) {
    cancel(slot.id, {
      onSuccess: () => toast.success("Slot cancelled"),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Fixed-time interview slots — Google Meet or on-campus.
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
              Add Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Slot" : "Add Slot"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mode">Mode</Label>
                <Select
                  value={mode}
                  onValueChange={(v) =>
                    form.setValue("mode", v as InterviewMode)
                  }
                >
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(settings?.allowGmeet ?? true) && (
                      <SelectItem value="gmeet">Google Meet</SelectItem>
                    )}
                    {(settings?.allowOnCampus ?? true) && (
                      <SelectItem value="on_campus">On Campus</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="scheduled_date">Date</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    {...form.register("scheduled_date")}
                  />
                  {form.formState.errors.scheduled_date && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.scheduled_date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="start_time">Start</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...form.register("start_time")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_time">End</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...form.register("end_time")}
                  />
                  {form.formState.errors.end_time && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.end_time.message}
                    </p>
                  )}
                </div>
              </div>

              {mode === "gmeet" && (
                <>
                  <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    A Google Meet link is generated automatically once this slot
                    is created — no need to add one manually.
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="interviewer_email">
                      Interviewer Email{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="interviewer_email"
                      type="email"
                      required
                      placeholder="interviewer@college.edu"
                      {...form.register("interviewer_email")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Added as an attendee on the Meet calendar event, so they
                      get the invite and can join directly.
                    </p>
                    {form.formState.errors.interviewer_email && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.interviewer_email.message}
                      </p>
                    )}
                  </div>
                </>
              )}
              {mode === "on_campus" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="campus_id">Campus</Label>
                    <Select
                      value={form.watch("campus_id") ?? ""}
                      onValueChange={(v) => form.setValue("campus_id", v)}
                    >
                      <SelectTrigger id="campus_id">
                        <SelectValue placeholder="Select a campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campuses?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Gives students the campus&apos;s address (and map
                      location, if geo-tagged) alongside this slot.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="venue">
                      Room / Venue Detail{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="venue"
                      placeholder="Admin Block, Room 3"
                      {...form.register("venue")}
                    />
                  </div>
                </>
              )}

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
                  Mode
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Date
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Time
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
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !slots || slots.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No interview slots scheduled yet.
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((slot) => (
                  <TableRow
                    key={slot.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span>{MODE_LABELS[slot.mode]}</span>
                        {slot.mode === "gmeet" && slot.meetingUrl && (
                          <a
                            href={slot.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Join link
                          </a>
                        )}
                        {slot.mode === "gmeet" && !slot.meetingUrl && (
                          <span className="text-xs text-muted-foreground">
                            Link pending...
                          </span>
                        )}
                        {slot.mode === "gmeet" && slot.interviewerEmail && (
                          <span className="text-xs text-muted-foreground">
                            {slot.interviewerEmail}
                          </span>
                        )}
                        {slot.mode === "on_campus" && slot.campus && (
                          <span className="text-xs text-muted-foreground">
                            {slot.campus.name}
                            {slot.venue ? ` — ${slot.venue}` : ""}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(slot.scheduledDate)}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {slot.startTime} – {slot.endTime}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[slot.status]}>
                        {slot.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        {slot.status === "active" && (
                          <>
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
                              disabled={isCancelling && cancelVars === slot.id}
                              onClick={() => handleCancel(slot)}
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                          </>
                        )}
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
