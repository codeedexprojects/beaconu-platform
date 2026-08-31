"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Video, Phone, MapPin, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/api";
import {
  useInterviewCandidate,
  usePanelAvailability,
  useScheduleInterview,
  useCompleteInterview,
} from "@/hooks/use-interviews";
import type { InterviewMode, InterviewOutcome } from "@beaconu/types";

const TIME_SLOTS = [
  { label: "09:00 AM - 10:00 AM", start: "09:00", end: "10:00" },
  { label: "10:00 AM - 11:00 AM", start: "10:00", end: "11:00" },
  { label: "11:00 AM - 12:00 PM", start: "11:00", end: "12:00" },
  { label: "12:00 PM - 01:00 PM", start: "12:00", end: "13:00" },
  { label: "02:00 PM - 03:00 PM", start: "14:00", end: "15:00" },
  { label: "03:00 PM - 04:00 PM", start: "15:00", end: "16:00" },
  { label: "04:00 PM - 05:00 PM", start: "16:00", end: "17:00" },
];

const MODES: {
  id: InterviewMode;
  label: string;
  sub: string;
  icon: typeof Video;
}[] = [
  { id: "gmeet", label: "Zoom Video", sub: "REMOTE LINK", icon: Video },
  { id: "telephonic", label: "Telephone", sub: "DIRECT DIAL", icon: Phone },
  { id: "on_campus", label: "In-person", sub: "ON CAMPUS", icon: MapPin },
];

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
        {n}
      </span>
      <h2 className="font-serif text-lg font-bold text-navy">{title}</h2>
    </div>
  );
}

export default function ScheduleInterviewPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCompleting = searchParams.get("complete") === "1";

  const { data: candidate, isLoading } = useInterviewCandidate(applicationId);

  const [date, setDate] = useState("");
  const [slotLabel, setSlotLabel] = useState("");
  const [panelSearch, setPanelSearch] = useState("");
  const [panelMemberId, setPanelMemberId] = useState("");
  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [venue, setVenue] = useState("");

  const [score, setScore] = useState("");
  const [outcome, setOutcome] = useState<InterviewOutcome | "">("");
  const [remarks, setRemarks] = useState("");

  const slot = TIME_SLOTS.find((s) => s.label === slotLabel);
  const availabilityQuery = useMemo(() => {
    if (!date || !slot) return null;
    return {
      scheduled_date: date,
      start_time: slot.start,
      end_time: slot.end,
      search: panelSearch || undefined,
      exclude_booking_id: candidate?.booking?.id,
    };
  }, [date, slot, panelSearch, candidate?.booking?.id]);

  const { data: panelList, isLoading: panelLoading } =
    usePanelAvailability(availabilityQuery);
  const selectedPanelMember = panelList?.find((p) => p.id === panelMemberId);

  const { mutate: schedule, isPending: isScheduling } = useScheduleInterview();
  const { mutate: complete, isPending: isCompletingPending } =
    useCompleteInterview();

  function handleConfirm() {
    if (!date || !slot || !panelMemberId || !mode) {
      toast.error("Fill in date, time, panel member, and mode");
      return;
    }
    if (mode === "on_campus" && !venue.trim()) {
      toast.error("Venue is required for in-person interviews");
      return;
    }
    schedule(
      {
        applicationId,
        data: {
          scheduled_date: date,
          start_time: slot.start,
          end_time: slot.end,
          panel_member_id: panelMemberId,
          mode,
          venue: mode === "on_campus" ? venue.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Interview scheduled");
          router.push("/interviews");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  function handleComplete() {
    if (!candidate?.booking) return;
    complete(
      {
        id: candidate.booking.id,
        data: {
          interview_score: score ? Number(score) : undefined,
          interview_outcome: outcome || undefined,
          interview_remarks: remarks || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Interview marked completed");
          router.push("/interviews");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!candidate) return null;

  if (isCompleting && candidate.booking) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">
            Complete Interview
          </h1>
          <p className="text-sm text-muted-foreground">
            {candidate.studentName}
          </p>
        </div>
        <div className="space-y-4 rounded-2xl border border-border bg-white p-6">
          <div>
            <Label>Score</Label>
            <Input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 85"
            />
          </div>
          <div>
            <Label>Outcome</Label>
            <Select
              value={outcome}
              onValueChange={(v) => setOutcome(v as InterviewOutcome)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="not_recommended">Not Recommended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            className="w-full bg-navy text-white hover:bg-navy/90"
            disabled={isCompletingPending}
            onClick={handleComplete}
          >
            {isCompletingPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Mark Completed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy">
            {candidate.booking ? "Reschedule Interview" : "Schedule Interview"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {candidate.studentName} · {candidate.applicationNumber}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <StepHeader n={1} title="Date & Time Selection" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Select Interview Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Preferred Time Slot</Label>
              <Select value={slotLabel} onValueChange={setSlotLabel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((s) => (
                    <SelectItem key={s.label} value={s.label}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <StepHeader n={2} title="Panel Member Assignment" />
          <Input
            placeholder="Search faculty by name..."
            value={panelSearch}
            onChange={(e) => setPanelSearch(e.target.value)}
            className="mb-3"
          />
          {!availabilityQuery ? (
            <p className="text-sm text-muted-foreground">
              Select a date and time slot first.
            </p>
          ) : panelLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Faculty
              </p>
              {(panelList ?? []).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={!p.isAvailable}
                  onClick={() => setPanelMemberId(p.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                    panelMemberId === p.id
                      ? "border-gold bg-gold-pale/40"
                      : "border-border"
                  } ${!p.isAvailable ? "cursor-not-allowed opacity-50" : "hover:bg-muted/40"}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">{p.name}</p>
                    {p.roleName && (
                      <p className="text-xs text-muted-foreground">
                        {p.roleName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-200 text-neutral-500"
                      }`}
                    >
                      {p.isAvailable ? "AVAILABLE" : "BUSY"}
                    </span>
                    {panelMemberId === p.id && (
                      <Check className="h-4 w-4 text-gold" />
                    )}
                  </div>
                </button>
              ))}
              {panelList && panelList.length === 0 && (
                <p className="text-sm text-muted-foreground">No staff found.</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <StepHeader n={3} title="Interview Mode" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                  mode === m.id
                    ? "border-gold bg-gold-pale/40"
                    : "border-border"
                }`}
              >
                <m.icon className="h-6 w-6 text-navy" />
                <span className="text-sm font-semibold text-navy">
                  {m.label}
                </span>
                <span className="text-[10px] tracking-wide text-muted-foreground">
                  {m.sub}
                </span>
              </button>
            ))}
          </div>
          {mode === "on_campus" && (
            <div className="mt-4">
              <Label>Venue</Label>
              <Input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Admin Block, Room 204"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 font-serif text-lg font-bold text-navy">
            Assignment Summary
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Applicant</dt>
              <dd className="font-semibold text-navy">
                {candidate.studentName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-semibold text-navy">
                {date && slot ? `${date} · ${slot.label}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Panel</dt>
              <dd className="font-semibold text-navy">
                {selectedPanelMember?.name ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Method</dt>
              <dd className="font-semibold text-navy">
                {mode ? MODES.find((m) => m.id === mode)?.label : "—"}
              </dd>
            </div>
          </dl>
          <Button
            className="mt-6 w-full bg-gold font-semibold text-navy hover:bg-gold/90"
            disabled={isScheduling}
            onClick={handleConfirm}
          >
            {isScheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Assignment
          </Button>
          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={() => router.push("/interviews")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
