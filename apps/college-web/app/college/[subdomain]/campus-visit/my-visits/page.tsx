"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, X, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store";
import {
  useCampusVisits,
  useRescheduleCampusVisit,
  useCancelCampusVisit,
  useCampusVisitAvailability,
} from "@/hooks/use-campus-visits";
import {
  getBookableDates,
  formatBookableDateLabel,
} from "@/lib/campus-visit-availability";
import type { CampusVisitListItem, CampusVisitStatus } from "@beaconu/types";

const STATUS_LABELS: Record<CampusVisitStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  reassigned: "Reassigned",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<CampusVisitStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  reassigned: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function MyVisitsPage() {
  const params = useParams<{ subdomain: string }>();
  const router = useRouter();
  const student = useAuthStore((s) => s.student);

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [rescheduleVisit, setRescheduleVisit] =
    useState<CampusVisitListItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");

  const { data: availability = [], isLoading: isLoadingAvailability } =
    useCampusVisitAvailability(student?.collegeId ?? "");
  const availableDates = getBookableDates(availability);

  const [cancelVisit, setCancelVisit] = useState<CampusVisitListItem | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading } = useCampusVisits({
    college_id: student?.collegeId,
    status: statusFilter || undefined,
    date: dateFilter || undefined,
  });

  const { mutate: reschedule, isPending: isRescheduling } =
    useRescheduleCampusVisit();
  const { mutate: cancel, isPending: isCancelling } = useCancelCampusVisit();

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Please log in to view your visits.</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/college/${params.subdomain}/login`)}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  function handleReschedule() {
    if (!rescheduleVisit || !rescheduleDate) return;
    reschedule(
      {
        visitId: rescheduleVisit.id,
        data: { proposed_date: rescheduleDate },
      },
      {
        onSuccess: () => {
          toast.success("Visit rescheduled successfully");
          setRescheduleVisit(null);
          setRescheduleDate("");
        },
      },
    );
  }

  function handleCancel() {
    if (!cancelVisit || !cancelReason.trim()) return;
    cancel(
      { visitId: cancelVisit.id, data: { cancellation_reason: cancelReason } },
      {
        onSuccess: () => {
          toast.success("Visit cancelled");
          setCancelVisit(null);
          setCancelReason("");
        },
      },
    );
  }

  const visits = data?.visits ?? [];
  const canModify = (status: CampusVisitStatus) =>
    status === "pending" || status === "confirmed";

  return (
    <div className="min-h-screen bg-[#fcfbf7] [font-family:Poppins,ui-sans-serif,system-ui]">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A2B44]">
              My Campus Visits
            </h1>
            <p className="mt-1 text-slate-600">
              Track and manage your scheduled visits.
            </p>
          </div>
          <Button
            onClick={() =>
              router.push(`/college/${params.subdomain}/campus-visit`)
            }
          >
            + Book New Visit
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring sm:w-48"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDateFilter(e.target.value)
            }
            className="sm:w-48"
          />

          {(statusFilter || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setDateFilter("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Visit list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-3xl bg-slate-100"
              />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-10 text-center">
            <p className="text-slate-500">No campus visits found.</p>
            <Button
              className="mt-4"
              onClick={() =>
                router.push(`/college/${params.subdomain}/campus-visit`)
              }
            >
              Book Your First Visit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[#1A2B44]">
                        Visit #{visit.id.split("-")[0]}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[visit.status]}`}
                      >
                        {STATUS_LABELS[visit.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-orange-400" />
                        {formatDate(visit.proposedDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-orange-400" />
                        {visit.proposedTime}
                      </span>
                      {visit.ambassador && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-orange-400" />
                          {visit.ambassador.fullName}
                        </span>
                      )}
                    </div>

                    {visit.reasonForVisit && (
                      <p className="text-sm text-slate-500">
                        {visit.reasonForVisit}
                      </p>
                    )}
                  </div>

                  {canModify(visit.status) && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRescheduleVisit(visit);
                          setRescheduleDate("");
                        }}
                      >
                        <RotateCcw className="mr-1 h-3 w-3" /> Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setCancelVisit(visit)}
                      >
                        <X className="mr-1 h-3 w-3" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reschedule Modal */}
      {rescheduleVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-[#1A2B44]">
              Reschedule Visit
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>New Date</Label>
                <select
                  value={rescheduleDate}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setRescheduleDate(e.target.value)
                  }
                  disabled={
                    isLoadingAvailability || availableDates.length === 0
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>
                    {isLoadingAvailability
                      ? "Loading available dates..."
                      : availableDates.length === 0
                        ? "No dates available right now"
                        : "Select a date"}
                  </option>
                  {availableDates.map((d) => (
                    <option key={d.date} value={d.date}>
                      {formatBookableDateLabel(d.date, d.time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRescheduleVisit(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={isRescheduling || !rescheduleDate}
              >
                {isRescheduling ? "Saving..." : "Confirm Reschedule"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-[#1A2B44]">
              Cancel Visit
            </h2>
            <div className="space-y-1">
              <Label>Reason for cancellation</Label>
              <textarea
                rows={3}
                placeholder="Please let us know why you're cancelling..."
                value={cancelReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCancelReason(e.target.value)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelVisit(null)}>
                Go back
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isCancelling || !cancelReason.trim()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
