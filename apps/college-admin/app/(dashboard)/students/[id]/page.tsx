"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  CreditCard,
  FileText,
  Home,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudentDetail } from "@/hooks/use-college-students";
import type {
  StudentDetailLedgerEntry,
  StudentDetailTransaction,
} from "@beaconu/types";

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  on_leave: "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  withdrawn: "bg-muted text-muted-foreground",
  course_switched: "bg-purple-50 text-purple-700 border-purple-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  awaiting_response: "bg-red-50 text-red-700 border-red-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-blue-50 text-blue-700 border-blue-200",
};

function statusClass(status: string) {
  return STATUS_BADGE_CLASS[status] ?? "bg-muted text-muted-foreground";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-5 space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function LedgerList({ entries }: { entries: StudentDetailLedgerEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">No entries.</p>;
  }
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-lg border p-3 space-y-1.5 text-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium">
              {entry.description ?? entry.feeCategory}
            </span>
            <Badge variant="outline" className={statusClass(entry.status)}>
              {entry.status}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <div>Amount</div>
              <div className="text-foreground font-medium">₹{entry.amount}</div>
            </div>
            <div>
              <div>Paid</div>
              <div className="text-foreground font-medium">
                ₹{entry.paidAmount}
              </div>
            </div>
            <div>
              <div>Balance</div>
              <div className="text-foreground font-medium">
                ₹{entry.balanceAmount}
              </div>
            </div>
          </div>
          {entry.transactions.length > 0 && (
            <div className="pt-1.5 border-t space-y-1">
              {entry.transactions.map((txn: StudentDetailTransaction) => (
                <div
                  key={txn.id}
                  className="flex justify-between text-xs text-muted-foreground"
                >
                  <span>
                    {txn.transactionNumber} · {txn.paymentMethod}
                  </span>
                  <span>
                    {txn.status} · {formatDateTime(txn.paidAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: student, isLoading } = useStudentDetail(studentId ?? null);

  if (isLoading || !student) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/students")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {student.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {student.email ?? "—"}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {student.phoneCountryCode ?? ""} {student.phoneNumber ?? "—"}
            </span>
          </div>
        </div>
        <Badge variant="outline" className={statusClass(student.status)}>
          {student.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Enrollment" icon={<FileText className="h-4 w-4" />}>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium">
                {student.enrollment.courseName} ({student.enrollment.courseCode}
                )
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Academic Year</span>
              <span>{student.enrollment.academicYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Enrollment #</span>
              <span>{student.enrollment.enrollmentNumber ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className={statusClass(student.enrollment.status)}
              >
                {student.enrollment.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Enrolled On</span>
              <span>{formatDate(student.enrollment.enrolledAt)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="BeaconU Card"
          icon={<CreditCard className="h-4 w-4" />}
        >
          {student.beaconuCard ? (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Card Number</span>
                <span className="font-medium">
                  {student.beaconuCard.cardNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium">
                  ₹{student.beaconuCard.balance}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Earned</span>
                <span>₹{student.beaconuCard.totalEarned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Until</span>
                <span>{formatDate(student.beaconuCard.validUntil)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={statusClass(student.beaconuCard.status)}
                >
                  {student.beaconuCard.status}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No card issued.</p>
          )}
        </SectionCard>

        <SectionCard title="Hostel" icon={<Home className="h-4 w-4" />}>
          {student.hostel ? (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hostel</span>
                <span className="font-medium">
                  {student.hostel.hostel.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Type</span>
                <span>{student.hostel.roomType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant="outline">{student.hostel.roomPlanType}</Badge>
              </div>
              {student.hostel.messPlan && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mess Plan</span>
                  <span>{student.hostel.messPlan.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={statusClass(student.hostel.status)}
                >
                  {student.hostel.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled From</span>
                <span>{formatDate(student.hostel.enrolledFrom)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Not enrolled in hostel.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Commute" icon={<Bus className="h-4 w-4" />}>
          {student.commute ? (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route</span>
                <span className="font-medium">
                  {student.commute.route.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bus</span>
                <span>
                  {student.commute.bus.busNumber}
                  {student.commute.bus.busName
                    ? ` — ${student.commute.bus.busName}`
                    : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup Stop</span>
                <span>{student.commute.pickupStop.stopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={statusClass(student.commute.status)}
                >
                  {student.commute.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled From</span>
                <span>{formatDate(student.commute.enrolledFrom)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Not enrolled in commute.
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Payments" icon={<CreditCard className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
          <div>
            <div className="text-xs text-muted-foreground">Total Paid</div>
            <div className="font-bold text-green-700">
              ₹{student.payments.totalPaid}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Due</div>
            <div className="font-bold text-amber-700">
              ₹{student.payments.totalDue}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5">
              Course Fees
            </h3>
            <LedgerList entries={student.payments.courseFees} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5">
              Hostel Fees
            </h3>
            <LedgerList entries={student.payments.hostelFees} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5">
              Commute Fees
            </h3>
            <LedgerList entries={student.payments.commuteFees} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Document Requests"
        icon={<FileText className="h-4 w-4" />}
      >
        {student.documentRequests.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No document requests yet.
          </p>
        ) : (
          <div className="space-y-2">
            {student.documentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">{req.documentName}</div>
                  <div className="text-xs text-muted-foreground">
                    Due {formatDate(req.deadline)}
                  </div>
                </div>
                <Badge variant="outline" className={statusClass(req.status)}>
                  {req.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Support Queries"
        icon={<MessageSquare className="h-4 w-4" />}
      >
        {student.supportTickets.length === 0 ? (
          <p className="text-xs text-muted-foreground">No queries submitted.</p>
        ) : (
          <div className="space-y-2">
            {student.supportTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/${ticket.id}`}
                className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50"
              >
                <div>
                  <div className="font-medium">{ticket.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    #{ticket.ticketNumber.slice(-6).toUpperCase()} · Updated{" "}
                    {formatDate(ticket.updatedAt)}
                  </div>
                </div>
                <Badge variant="outline" className={statusClass(ticket.status)}>
                  {ticket.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
