"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Mail, Phone, Calendar, Video, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import {
  useInterviewBookings,
  useCancelInterview,
} from "@/hooks/use-interviews";
import type {
  InterviewBookingItem,
  PendingInterviewItem,
} from "@beaconu/types";

const AVATAR_PALETTE = [
  "bg-neutral-100 text-neutral-700",
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash + seed.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[hash];
}

const TABS = [
  { id: "pending", label: "Pending" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const MODE_ICON = {
  gmeet: Video,
  telephonic: Phone,
  on_campus: MapPin,
} as const;
const MODE_LABEL = {
  gmeet: "Zoom Video",
  telephonic: "Telephone",
  on_campus: "In-person",
} as const;

function Avatar({
  seed,
  name,
  photoUrl,
}: {
  seed: string;
  name: string;
  photoUrl: string | null;
}) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={56}
        height={56}
        className="h-14 w-14 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-serif font-bold ${avatarColor(seed)}`}
    >
      {initials(name)}
    </span>
  );
}

function CandidateCard({
  applicationId,
  applicationNumber,
  studentName,
  studentEmail,
  studentPhotoUrl,
  program,
  tab,
  booking,
  onCancel,
}: {
  applicationId: string;
  applicationNumber: string;
  studentName: string;
  studentEmail: string | null;
  studentPhotoUrl: string | null;
  program: string | null;
  tab: TabId;
  booking?: InterviewBookingItem;
  onCancel?: (bookingId: string) => void;
}) {
  const router = useRouter();
  const ModeIcon = booking?.mode ? MODE_ICON[booking.mode] : null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            seed={applicationId}
            name={studentName}
            photoUrl={studentPhotoUrl}
          />
          <div>
            <p className="font-serif text-lg font-bold text-navy">
              {studentName}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {applicationNumber}
            </p>
          </div>
        </div>
        {tab !== "completed" && (
          <span className="whitespace-nowrap rounded-full bg-gold-pale px-3 py-1 text-[10px] font-bold tracking-wide text-gold">
            SHORTLISTED
          </span>
        )}
      </div>

      {program && <p className="text-sm text-muted-foreground">{program}</p>}
      {studentEmail && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          {studentEmail}
        </p>
      )}

      {booking && booking.scheduledDate && (
        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {booking.scheduledDate} · {booking.startTime}–{booking.endTime}
          </p>
          {ModeIcon && booking.mode && (
            <p className="mt-1 flex items-center gap-1.5">
              <ModeIcon className="h-3.5 w-3.5" />
              {MODE_LABEL[booking.mode]}
              {booking.panelMemberName ? ` · ${booking.panelMemberName}` : ""}
            </p>
          )}
        </div>
      )}

      {tab === "completed" && booking && (
        <div className="rounded-lg bg-muted/40 p-3 text-xs">
          <p className="font-semibold text-navy">
            {booking.interviewOutcome === "recommended"
              ? "Recommended"
              : booking.interviewOutcome === "not_recommended"
                ? "Not Recommended"
                : "Outcome pending"}
          </p>
          {booking.interviewScore && (
            <p className="text-muted-foreground">
              Score: {booking.interviewScore}
            </p>
          )}
        </div>
      )}

      <div className="mt-1 flex gap-2">
        {tab === "pending" && (
          <Button
            className="w-full rounded-lg bg-gold font-semibold text-navy hover:bg-gold/90"
            onClick={() => router.push(`/interviews/${applicationId}/schedule`)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        )}
        {tab === "scheduled" && booking && (
          <>
            <Button
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() =>
                router.push(`/interviews/${applicationId}/schedule`)
              }
            >
              Reschedule
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() =>
                router.push(`/interviews/${applicationId}/schedule?complete=1`)
              }
            >
              Complete
            </Button>
            {onCancel && (
              <Button
                variant="outline"
                className="rounded-lg border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => onCancel(booking.id)}
              >
                Cancel
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function InterviewsPage() {
  const [tab, setTab] = useState<TabId>("pending");
  const [search, setSearch] = useState("");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const { data, isLoading } = useInterviewBookings({
    status: tab,
    search: search || undefined,
  });
  const { mutate: cancelInterview, isPending: isCancelling } =
    useCancelInterview();

  function confirmCancel() {
    if (!cancelTarget) return;
    cancelInterview(cancelTarget, {
      onSuccess: () => {
        toast.success("Interview cancelled");
        setCancelTarget(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Interview Scheduling
        </h1>
        <p className="text-sm text-muted-foreground">
          Review candidates ready for interview, assign a panel member, and
          confirm the schedule.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "bg-navy text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants by name, application ID..."
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="mt-3 h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No {tab} candidates.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tab === "pending"
            ? (rows as PendingInterviewItem[]).map((item) => (
                <CandidateCard
                  key={item.applicationId}
                  applicationId={item.applicationId}
                  applicationNumber={item.applicationNumber}
                  studentName={item.studentName}
                  studentEmail={item.studentEmail}
                  studentPhotoUrl={item.studentPhotoUrl}
                  program={item.courses[0]?.courseName ?? null}
                  tab={tab}
                />
              ))
            : (rows as InterviewBookingItem[]).map((item) => (
                <CandidateCard
                  key={item.id}
                  applicationId={item.applicationId}
                  applicationNumber={item.applicationNumber}
                  studentName={item.studentName}
                  studentEmail={item.studentEmail}
                  studentPhotoUrl={item.studentPhotoUrl}
                  program={item.courses[0]?.courseName ?? null}
                  tab={tab}
                  booking={item}
                  onCancel={(id) => setCancelTarget(id)}
                />
              ))}
        </div>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel Interview"
        description="Cancel this scheduled interview? The candidate will move back to Pending so it can be rescheduled."
        confirmLabel="Cancel Interview"
        variant="destructive"
        loading={isCancelling}
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
