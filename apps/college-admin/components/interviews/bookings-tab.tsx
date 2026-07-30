"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  useInterviewBookings,
  useCompleteInterview,
  useShortlistCourse,
} from "@/hooks/use-interviews";
import type { InterviewBookingItem, InterviewOutcome } from "@beaconu/types";

const completeSchema = z.object({
  interview_score: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().min(0).optional(),
  ),
  interview_outcome: z.enum(["recommended", "not_recommended"]).optional(),
  interview_remarks: z.string().trim().optional(),
});
type CompleteFormValues = z.infer<typeof completeSchema>;

const EMPTY_VALUES: CompleteFormValues = {
  interview_score: undefined,
  interview_outcome: undefined,
  interview_remarks: "",
};

const STATUS_VARIANT: Record<
  InterviewBookingItem["status"],
  "default" | "secondary" | "destructive"
> = {
  booked: "secondary",
  completed: "default",
  cancelled: "destructive",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InterviewBookingsTab() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [completing, setCompleting] = useState<InterviewBookingItem | null>(
    null,
  );
  const [shortlisting, setShortlisting] = useState<InterviewBookingItem | null>(
    null,
  );

  const { data: bookings, isLoading } = useInterviewBookings(
    statusFilter || undefined,
  );
  const { mutate: complete, isPending: isCompleting } = useCompleteInterview();
  const { mutate: shortlist, isPending: isShortlisting } = useShortlistCourse();

  const form = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openComplete(booking: InterviewBookingItem) {
    setCompleting(booking);
    form.reset(EMPTY_VALUES);
  }

  function onSubmit(values: CompleteFormValues) {
    if (!completing) return;
    complete(
      { id: completing.id, data: values },
      {
        onSuccess: () => {
          toast.success("Interview marked completed");
          setCompleting(null);
        },
      },
    );
  }

  function confirmShortlist() {
    if (!shortlisting) return;
    shortlist(shortlisting.applicationCourseId, {
      onSuccess: () => {
        toast.success("Application course shortlisted");
        setShortlisting(null);
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Every interview booking at your college.
        </p>
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Student
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Slot
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Outcome
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Score
                </TableHead>
                <TableHead className="w-[220px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !bookings || bookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No interview bookings yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm">
                      <p className="font-medium">{booking.studentName}</p>
                      {booking.slot.mode === "telephonic" &&
                        booking.studentPhone && (
                          <a
                            href={`tel:${booking.studentPhone}`}
                            className="text-xs text-primary hover:underline"
                          >
                            {booking.studentPhone}
                          </a>
                        )}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {booking.slot.mode.replace("_", " ")} ·{" "}
                      {formatDateTime(
                        `${booking.slot.scheduledDate}T${booking.slot.startTime}:00.000Z`,
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[booking.status]}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {booking.interviewOutcome
                        ? booking.interviewOutcome.replace("_", " ")
                        : "—"}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {booking.interviewScore ?? "—"}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === "booked" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => openComplete(booking)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </Button>
                        )}
                        {booking.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => setShortlisting(booking)}
                          >
                            <Star className="h-3.5 w-3.5" />
                            Shortlist
                          </Button>
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

      <Dialog
        open={!!completing}
        onOpenChange={(v) => !v && setCompleting(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Interview</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="interview_score">
                Score <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="interview_score"
                type="number"
                step="0.1"
                placeholder="e.g. 8.5"
                {...form.register("interview_score")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interview_outcome">Outcome</Label>
              <Select
                value={form.watch("interview_outcome") ?? ""}
                onValueChange={(v) =>
                  form.setValue("interview_outcome", v as InterviewOutcome)
                }
              >
                <SelectTrigger id="interview_outcome">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="not_recommended">
                    Not Recommended
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interview_remarks">
                Remarks{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="interview_remarks"
                rows={3}
                placeholder="Notes about the candidate's performance..."
                {...form.register("interview_remarks")}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompleting(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCompleting}>
                {isCompleting ? "Saving..." : "Mark Completed"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!shortlisting}
        onOpenChange={(v) => !v && setShortlisting(null)}
        title="Shortlist this application?"
        description={
          shortlisting
            ? `"${shortlisting.studentName}" will be marked shortlisted for this course. This doesn't issue an offer letter yet.`
            : undefined
        }
        confirmLabel="Shortlist"
        variant="default"
        isPending={isShortlisting}
        onConfirm={confirmShortlist}
      />
    </div>
  );
}
