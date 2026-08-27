"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Phone,
  PhoneCall,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api";
import {
  useCallRequest,
  useUpdateCallRequestStatus,
} from "@/hooks/use-call-requests";
import type { CallRequestStatus } from "@beaconu/types";

const STATUS_LABELS: Record<CallRequestStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  cancelled: "Cancelled",
};

const STATUS_BADGE_CLASS: Record<CallRequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-muted text-muted-foreground border-border/60",
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CallRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: request, isLoading } = useCallRequest(id ?? null);
  const { mutate: setStatus, isPending: isUpdating } =
    useUpdateCallRequestStatus(id as string);

  const [note, setNote] = useState("");

  if (isLoading || !request) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPending = request.status === "pending";

  function handleUpdate(status: "contacted" | "cancelled") {
    setStatus(
      { status, staff_note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(
            status === "contacted"
              ? "Marked as contacted"
              : "Call request cancelled",
          );
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/call-requests")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">
            {request.studentName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {request.studentEmail ?? "—"} · Requested{" "}
            {formatDateTime(request.createdAt)}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_BADGE_CLASS[request.status]}>
          {STATUS_LABELS[request.status]}
        </Badge>
      </div>

      <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Call Back Requested
              </p>
              <p className="text-xl font-bold text-emerald-900">
                {request.phoneNumber}
              </p>
              {request.preferredTime && (
                <p className="flex items-center gap-1.5 text-sm text-emerald-700 mt-0.5">
                  <Clock className="h-3.5 w-3.5" />
                  Preferred time: {request.preferredTime}
                </p>
              )}
            </div>
          </div>
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <a href={`tel:${request.phoneNumber}`}>
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          </Button>
        </CardContent>
      </Card>

      {request.message && (
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Student&apos;s Message
          </p>
          <p className="mt-1 text-sm">{request.message}</p>
        </div>
      )}

      {isPending ? (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Mark this request as handled</p>
          <Textarea
            placeholder="Add a note about the call (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={isUpdating}
              onClick={() => handleUpdate("contacted")}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PhoneCall className="h-4 w-4" />
              )}
              Mark as Contacted
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              disabled={isUpdating}
              onClick={() => handleUpdate("cancelled")}
            >
              <XCircle className="h-4 w-4" />
              Cancel Request
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-4">
          <p className="text-sm text-muted-foreground">
            This request is {STATUS_LABELS[request.status].toLowerCase()}
            {request.respondedByName ? ` by ${request.respondedByName}` : ""}
            {request.respondedAt
              ? ` on ${formatDateTime(request.respondedAt)}`
              : ""}
            .
          </p>
          {request.staffNote && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Note:</span> {request.staffNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
