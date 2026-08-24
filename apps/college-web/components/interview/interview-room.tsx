"use client";

import { XCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/api";
import { useMyApplication } from "@/hooks/use-application";
import { useMyInterviewBooking } from "@/hooks/use-interview";
import { InterviewSlotPicker } from "@/components/interview/interview-slot-picker";
import { InterviewBookingDetail } from "@/components/interview/interview-booking-detail";
import { IconSectionHeader } from "@/components/ui/icon-section-header";

interface InterviewRoomProps {
  applicationId: string;
}

export function InterviewRoom({ applicationId }: InterviewRoomProps) {
  const {
    data: application,
    isLoading: isLoadingApplication,
    error: applicationError,
  } = useMyApplication(applicationId, true);
  const {
    data: booking,
    isLoading: isLoadingBooking,
    error: bookingError,
  } = useMyInterviewBooking(applicationId, !!application);

  if (isLoadingApplication || isLoadingBooking) {
    return <div className="h-64 animate-pulse rounded-2xl border bg-muted" />;
  }

  if (applicationError || bookingError) {
    return (
      <p className="rounded-2xl border border-border/60 p-5 text-sm text-destructive">
        {getErrorMessage(applicationError ?? bookingError)}
      </p>
    );
  }

  if (!application) {
    return (
      <p className="rounded-2xl border border-border/60 p-5 text-sm text-destructive">
        Application not found.
      </p>
    );
  }

  if (booking && booking.status !== "cancelled") {
    return (
      <InterviewBookingDetail booking={booking} applicationId={applicationId} />
    );
  }

  // interview_bookings has a database-level unique constraint on
  // application_id — confirmed directly against the backend repository
  // (findByApplicationId uses prisma's findUnique, not findFirst). Once a
  // booking exists for this application, even cancelled, a second POST
  // /bookings for the same application is permanently rejected with
  // RESOURCE_CONFLICT. Cancelling an interview is a one-way action, not a
  // "pick a different slot" action — showing the picker again here would
  // let the student pick a slot only to have the booking API reject it
  // every time. Show a locked-out state instead.
  if (booking && booking.status === "cancelled") {
    return (
      <div className="space-y-3 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader
          icon={XCircle}
          title="Interview Cancelled"
          subLabel="Booking Closed"
        />
        <p className="text-sm text-muted-foreground">
          You cancelled your interview booking. This application can&apos;t book
          a new slot on its own — please contact the college to arrange a new
          interview time.
        </p>
      </div>
    );
  }

  return (
    <InterviewSlotPicker
      collegeId={application.collegeId}
      applicationId={applicationId}
    />
  );
}
