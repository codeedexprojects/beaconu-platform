"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Award, CalendarCheck, Loader2, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import { useRequestInterviewReschedule } from "@/hooks/use-interview";
import type { InterviewBookingItem } from "@beaconu/types";

interface InterviewBookingDetailProps {
  booking: InterviewBookingItem;
  applicationId: string;
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function InterviewBookingDetail({
  booking,
  applicationId,
}: InterviewBookingDetailProps) {
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleSubmitted, setRescheduleSubmitted] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate: requestReschedule, isPending: isRequestingReschedule } =
    useRequestInterviewReschedule(booking.id, applicationId);

  const { slot } = booking;
  const isBooked = booking.status === "booked";
  const isCompleted = booking.status === "completed";

  function handleRequestReschedule() {
    if (!reason.trim()) {
      toast.error("Please tell us why you need to reschedule");
      return;
    }
    requestReschedule(
      { reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Reschedule request submitted");
          setRescheduleSubmitted(true);
          setShowRescheduleForm(false);
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader
          icon={CalendarCheck}
          title="Your Interview"
          subLabel={isCompleted ? "Completed" : "Booked"}
        />

        <div className="rounded-2xl border border-border/40 bg-field p-4">
          <p className="text-base font-semibold text-foreground">
            {formatDate(slot.scheduledDate)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {slot.startTime} – {slot.endTime}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
            {slot.mode === "gmeet" ? (
              <>
                <Video className="h-4 w-4 text-accentOrange" />
                Video Call
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-accentOrange" />
                {slot.campus?.name ?? "On Campus"}
                {slot.venue ? ` · ${slot.venue}` : ""}
              </>
            )}
          </p>
          {slot.mode === "gmeet" && slot.meetingUrl ? (
            <a
              href={slot.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
            >
              Join Video Call
            </a>
          ) : null}
        </div>

        {booking.instructions.instructions.length > 0 ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accentOrange">
              {booking.instructions.heading ?? "Instructions"}
            </p>
            {booking.instructions.description ? (
              <p className="mb-2 text-sm text-muted-foreground">
                {booking.instructions.description}
              </p>
            ) : null}
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {booking.instructions.instructions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {isCompleted ? (
          <div className="rounded-2xl border border-border/40 p-4">
            <div className="mb-1 flex items-center gap-2">
              <Award className="h-4 w-4 text-accentOrange" />
              <p className="text-sm font-semibold text-foreground">
                Interview Outcome
              </p>
            </div>
            {booking.interviewOutcome ? (
              <p className="text-sm text-muted-foreground">
                {booking.interviewOutcome === "recommended"
                  ? "Recommended"
                  : "Not Recommended"}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Awaiting evaluation.
              </p>
            )}
            {booking.interviewRemarks ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {booking.interviewRemarks}
              </p>
            ) : null}
          </div>
        ) : null}

        {isBooked ? (
          !rescheduleSubmitted ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRescheduleForm((v) => !v)}
              className="h-11 w-full rounded-full"
            >
              Request Reschedule
            </Button>
          ) : (
            <p className="flex items-center justify-center rounded-full border border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
              Reschedule request submitted
            </p>
          )
        ) : null}

        {showRescheduleForm ? (
          <div className="space-y-2 rounded-2xl border border-border/40 p-4">
            <label className="text-xs font-medium text-muted-foreground">
              Why do you need to reschedule?
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Let us know your reason..."
              className="w-full rounded-2xl border-0 bg-field px-4 py-3 text-sm text-foreground outline-none transition-colors focus:bg-field-focus focus-visible:ring-2 focus-visible:ring-accentOrange/40"
            />
            <p className="text-xs text-muted-foreground">
              You can only request a reschedule once, and at least 30 minutes
              before your interview time.
            </p>
            <Button
              type="button"
              onClick={handleRequestReschedule}
              disabled={isRequestingReschedule}
              className="h-11 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-sm font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
            >
              {isRequestingReschedule ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Request
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
