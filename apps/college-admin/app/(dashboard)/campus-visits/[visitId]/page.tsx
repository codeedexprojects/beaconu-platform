"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollegeCampusVisit } from "@/hooks/use-campus-visits";
import type { CampusVisitStatus } from "@beaconu/types";

const STATUS_LABELS: Record<CampusVisitStatus, string> = {
  pending: "Pending",
  arrived: "Arrived",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  reassigned: "Reassigned",
};

const STATUS_VARIANTS: Record<
  CampusVisitStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  arrived: "secondary",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
  reassigned: "secondary",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function CampusVisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const router = useRouter();

  const { data: visit, isLoading, error } = useCollegeCampusVisit(visitId);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-5">
              <Skeleton className="mb-4 h-4 w-24" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">Campus visit not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const guests =
    Array.isArray(visit.guests) &&
    visit.guests.length > 0 &&
    typeof (visit.guests[0] as { name?: unknown }).name === "string"
      ? (visit.guests as { name: string; relation: string }[])
      : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Visit #{visit.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Booked on{" "}
            {new Date(visit.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[visit.status]} className="text-sm">
          {STATUS_LABELS[visit.status]}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Visitor">
          <DetailRow
            icon={<User className="h-4 w-4" />}
            label="Full Name"
            value={visit.studentName}
          />
          {visit.email && (
            <DetailRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={
                <a
                  href={`mailto:${visit.email}`}
                  className="text-primary hover:underline"
                >
                  {visit.email}
                </a>
              }
            />
          )}
          {visit.phoneNumber && (
            <DetailRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={
                <a
                  href={`tel:${visit.phoneNumber}`}
                  className="text-primary hover:underline"
                >
                  {visit.phoneNumber}
                </a>
              }
            />
          )}
          {visit.additionalVisitorsCount > 0 && (
            <DetailRow
              icon={<Users className="h-4 w-4" />}
              label="Additional Visitors"
              value={`${visit.additionalVisitorsCount} person${visit.additionalVisitorsCount > 1 ? "s" : ""}`}
            />
          )}
        </Section>

        {/* Schedule & Ambassador */}
        <Section title="Schedule">
          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Proposed Date"
            value={formatDate(visit.proposedDate)}
          />
          <DetailRow
            icon={<Clock className="h-4 w-4" />}
            label="Proposed Time"
            value={visit.proposedTime}
          />
          {visit.previousProposedDate && (
            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Previously Scheduled"
              value={`${formatDate(visit.previousProposedDate)} at ${visit.previousProposedTime}`}
            />
          )}
          {visit.ambassador ? (
            <DetailRow
              icon={<MapPin className="h-4 w-4" />}
              label="Ambassador"
              value={
                <span>
                  {visit.ambassador.fullName}
                  {visit.ambassador.campusCode && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({visit.ambassador.campusCode})
                    </span>
                  )}
                </span>
              }
            />
          ) : (
            <DetailRow
              icon={<MapPin className="h-4 w-4" />}
              label="Ambassador"
              value={
                <span className="text-muted-foreground">Not assigned</span>
              }
            />
          )}
        </Section>

        {/* Visit Info */}
        <Section title="Visit Info">
          {visit.reasonForVisit && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                Reason for Visit
              </p>
              <p className="text-sm">{visit.reasonForVisit}</p>
            </div>
          )}
          {visit.cancellationReason && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                Cancellation Reason
              </p>
              <p className="text-sm text-destructive">
                {visit.cancellationReason}
              </p>
            </div>
          )}
          {visit.visitNotes && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Visit Notes</p>
              <p className="text-sm">{visit.visitNotes}</p>
            </div>
          )}
          {visit.visitRating != null && (
            <DetailRow
              icon={<span className="text-xs">★</span>}
              label="Rating"
              value={`${visit.visitRating} / 5`}
            />
          )}
        </Section>
      </div>

      {/* Guests */}
      {guests.length > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Guest List
          </h2>
          <div className="divide-y">
            {guests.map((g, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium">{g.name}</span>
                <span className="text-sm text-muted-foreground">
                  {g.relation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
