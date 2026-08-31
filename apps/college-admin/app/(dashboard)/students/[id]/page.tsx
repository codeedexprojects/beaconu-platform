"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  CreditCard,
  Download,
  Eye,
  FileText,
  Home,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useStudentDetail } from "@/hooks/use-college-students";
import { useApplication } from "@/hooks/use-applications";
import type {
  AcademicRecords,
  ApplicationDetailDocumentItem,
  ApplicationDetailDto,
  AddressBlock,
  ResultSummary,
  StudentDetailDto,
  StudentDetailLedgerEntry,
  StudentDetailTransaction,
  SubjectMarksEntry,
  UndergraduateDetailsInput,
} from "@beaconu/types";

const AVATAR_PALETTE = [
  "bg-neutral-100 text-neutral-700",
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "qualifications", label: "Qualifications" },
  { id: "documents", label: "Documents" },
  { id: "payments", label: "Payments" },
] as const;
type TabId = (typeof TABS)[number]["id"];

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
  approved: "bg-green-50 text-green-700 border-green-200",
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

function formatDate(dateStr: string | null | undefined) {
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

function humanize(value: string | null | undefined) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------- shared bits ---------- */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-lg bg-gold-pale/50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-navy">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-base font-bold text-navy">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-pale text-gold">
            {icon}
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddressView({
  title,
  block,
}: {
  title: string;
  block: Partial<AddressBlock> | null | undefined;
}) {
  if (!block || !block.address_line1) {
    return (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">No address on file.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <InfoBox label="Street" value={block.address_line1} />
        {block.address_line2 && (
          <InfoBox label="Landmark" value={block.address_line2} />
        )}
        <InfoBox label="City" value={block.city} />
        <InfoBox label="District" value={block.district} />
        <InfoBox label="State" value={block.state} />
        <InfoBox label="PIN Code" value={block.pin_code} />
      </div>
    </div>
  );
}

/* ---------- Qualifications tab ---------- */

function SubjectsMiniTable({ subjects }: { subjects: SubjectMarksEntry[] }) {
  if (!subjects || subjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No subjects on file.</p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-gold-pale/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Subject Name</th>
            <th className="px-3 py-2 text-left font-semibold">Max Marks</th>
            <th className="px-3 py-2 text-left font-semibold">
              Marks Obtained
            </th>
            <th className="px-3 py-2 text-left font-semibold">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, i) => (
            <tr key={i} className="border-t border-border">
              <td className="px-3 py-2">{s.subject_name}</td>
              <td className="px-3 py-2">{s.max_marks}</td>
              <td className="px-3 py-2 font-medium">{s.obtained_marks}</td>
              <td className="px-3 py-2">{s.attempts ?? 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SchoolLevelCard({
  title,
  subtitle,
  subjects,
  result,
}: {
  title: string;
  subtitle: string | null;
  subjects: SubjectMarksEntry[];
  result: ResultSummary | undefined;
}) {
  const totalMax = subjects.reduce((sum, s) => sum + (s.max_marks ?? 0), 0);
  const totalObtained = subjects.reduce(
    (sum, s) => sum + (s.obtained_marks ?? 0),
    0,
  );
  const percentage =
    result?.percentage ??
    (totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : null);

  return (
    <div className="relative pl-8">
      <span className="absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
        <ShieldCheck className="h-3 w-3" />
      </span>
      <span className="absolute left-[9px] top-7 bottom-[-1.5rem] w-px bg-border" />
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-navy">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {percentage !== null && (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              {percentage >= 35 ? "Pass" : "Result"}
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <SubjectsMiniTable subjects={subjects} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoBox label="Total Marks" value={totalObtained || null} />
          <InfoBox label="Max Marks" value={totalMax || null} />
          <InfoBox
            label="Percentage"
            value={percentage !== null ? `${percentage}%` : null}
          />
          <InfoBox
            label="Result"
            value={
              percentage !== null ? (percentage >= 35 ? "Pass" : "—") : null
            }
          />
        </div>
      </div>
    </div>
  );
}

function DegreeLevelCard({
  title,
  record,
}: {
  title: string;
  record: UndergraduateDetailsInput;
}) {
  const status = record.final_summary?.result_status ?? "Ongoing";
  return (
    <div className="relative pl-8">
      <span className="absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
        <ShieldCheck className="h-3 w-3" />
      </span>
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-navy">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {record.institution_name} · {record.university_name}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              /ongoing/i.test(status)
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
          >
            {humanize(status)}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoBox label="Program" value={record.program_name} />
          <InfoBox label="Specialization" value={record.specialization} />
          <InfoBox label="Admission Year" value={record.admission_year} />
          <InfoBox label="Duration" value={`${record.duration_years} yrs`} />
        </div>

        {record.semester_records && record.semester_records.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-gold-pale/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">
                    Semester
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Duration
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">CGPA/%</th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Backlogs
                  </th>
                </tr>
              </thead>
              <tbody>
                {record.semester_records.slice(0, 3).map((s, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2">{s.label}</td>
                    <td className="px-3 py-2">{s.duration ?? "—"}</td>
                    <td className="px-3 py-2 font-medium">
                      {s.cgpa_or_percentage ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {s.backlogs ? (
                        <span className="text-red-600">
                          {s.backlogs} Active
                        </span>
                      ) : (
                        <span className="text-emerald-600">No Backlogs</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {record.semester_records.length > 3 && (
              <p className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
                ... Showing 3 of {record.semester_records.length} semesters
              </p>
            )}
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoBox
            label="Total Credits"
            value={record.final_summary?.total_credits ?? null}
          />
          <InfoBox label="CGPA" value={record.final_summary?.cgpa ?? null} />
          <InfoBox
            label="Backlogs"
            value={record.final_summary?.total_backlogs ?? 0}
          />
          <InfoBox label="Result Status" value={humanize(status)} />
        </div>
      </div>
    </div>
  );
}

function QualificationsTab({
  qualificationDetails,
  isLoading,
}: {
  qualificationDetails: Partial<AcademicRecords> | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const records = qualificationDetails ?? {};
  const hasAny =
    records.tenth_grade ||
    records.twelfth_grade ||
    records.undergraduate ||
    records.pg ||
    records.diploma;

  if (!hasAny) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
        No academic qualification records on file.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-lg font-bold text-navy">
        Academic Journey
      </h2>
      {records.tenth_grade && (
        <SchoolLevelCard
          title="Class 10"
          subtitle={`${records.tenth_grade.board_name} · ${records.tenth_grade.school_name}`}
          subjects={records.tenth_grade.subjects}
          result={records.tenth_grade.result_summary}
        />
      )}
      {records.twelfth_grade && (
        <SchoolLevelCard
          title="Class 12 / PUC"
          subtitle={`${records.twelfth_grade.board_name} · ${records.twelfth_grade.school_name}`}
          subjects={records.twelfth_grade.subjects}
          result={records.twelfth_grade.result_summary}
        />
      )}
      {records.undergraduate && (
        <DegreeLevelCard title="Undergraduate" record={records.undergraduate} />
      )}
      {records.pg && (
        <DegreeLevelCard title="Postgraduate" record={records.pg} />
      )}
      {records.diploma && (
        <DegreeLevelCard title="Diploma" record={records.diploma} />
      )}
    </div>
  );
}

/* ---------- Documents tab ---------- */

function DocumentTile({ doc }: { doc: ApplicationDetailDocumentItem }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-white p-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-pale text-gold">
          <FileText className="h-4 w-4" />
        </span>
        <span className="truncate text-sm font-medium text-navy">
          {humanize(doc.documentType)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <Eye className="h-3.5 w-3.5" />
        </a>
        <a
          href={doc.fileUrl}
          download
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function DocumentsTab({
  student,
  application,
  isLoading,
}: {
  student: StudentDetailDto;
  application: ApplicationDetailDto | undefined;
  isLoading: boolean;
}) {
  const documents = application?.documents ?? [];
  const grouped = documents.reduce<
    Record<string, ApplicationDetailDocumentItem[]>
  >((acc, doc) => {
    const key = doc.documentCategory || "other";
    acc[key] = acc[key] ?? [];
    acc[key].push(doc);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <SectionCard
              key={category}
              title={humanize(category)}
              icon={<FileText className="h-3.5 w-3.5" />}
            >
              <div className="space-y-2">
                {grouped[category].map((doc) => (
                  <DocumentTile key={doc.id} doc={doc} />
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      <SectionCard
        title="Document Requests"
        icon={<FileText className="h-3.5 w-3.5" />}
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
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
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
    </div>
  );
}

/* ---------- Payments tab ---------- */

function LedgerList({ entries }: { entries: StudentDetailLedgerEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">No entries.</p>;
  }
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-lg border border-border p-3 space-y-1.5 text-sm"
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
            <div className="pt-1.5 border-t border-border space-y-1">
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

function PaymentsTab({ student }: { student: StudentDetailDto }) {
  return (
    <SectionCard title="Payments" icon={<CreditCard className="h-3.5 w-3.5" />}>
      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
        <InfoBox label="Total Paid" value={`₹${student.payments.totalPaid}`} />
        <InfoBox label="Total Due" value={`₹${student.payments.totalDue}`} />
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
  );
}

/* ---------- Overview tab ---------- */

function OverviewTab({
  student,
  application,
  isAppLoading,
}: {
  student: StudentDetailDto;
  application: ApplicationDetailDto | undefined;
  isAppLoading: boolean;
}) {
  const personal = application?.personalDetails;
  const family = application?.familyDetails;
  const address = application?.addressDetails;
  const declaration = application?.declaration;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="Enrollment"
          icon={<FileText className="h-3.5 w-3.5" />}
        >
          <div className="grid grid-cols-2 gap-2">
            <InfoBox
              label="Course"
              value={`${student.enrollment.courseName} (${student.enrollment.courseCode})`}
            />
            <InfoBox
              label="Academic Year"
              value={student.enrollment.academicYear}
            />
            <InfoBox
              label="Enrollment #"
              value={student.enrollment.enrollmentNumber}
            />
            <InfoBox
              label="Enrolled On"
              value={formatDate(student.enrollment.enrolledAt)}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="BeaconU Card"
          icon={<CreditCard className="h-3.5 w-3.5" />}
        >
          {student.beaconuCard ? (
            <div className="grid grid-cols-2 gap-2">
              <InfoBox
                label="Card Number"
                value={student.beaconuCard.cardNumber}
              />
              <InfoBox
                label="Balance"
                value={`₹${student.beaconuCard.balance}`}
              />
              <InfoBox
                label="Total Earned"
                value={`₹${student.beaconuCard.totalEarned}`}
              />
              <InfoBox
                label="Valid Until"
                value={formatDate(student.beaconuCard.validUntil)}
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No card issued.</p>
          )}
        </SectionCard>

        <SectionCard title="Hostel" icon={<Home className="h-3.5 w-3.5" />}>
          {student.hostel ? (
            <div className="grid grid-cols-2 gap-2">
              <InfoBox label="Hostel" value={student.hostel.hostel.name} />
              <InfoBox label="Room Type" value={student.hostel.roomType.name} />
              <InfoBox
                label="Plan"
                value={humanize(student.hostel.roomPlanType)}
              />
              <InfoBox label="Status" value={humanize(student.hostel.status)} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Not enrolled in hostel.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Commute" icon={<Bus className="h-3.5 w-3.5" />}>
          {student.commute ? (
            <div className="grid grid-cols-2 gap-2">
              <InfoBox label="Route" value={student.commute.route.name} />
              <InfoBox label="Bus" value={student.commute.bus.busNumber} />
              <InfoBox
                label="Pickup Stop"
                value={student.commute.pickupStop.stopName}
              />
              <InfoBox
                label="Status"
                value={humanize(student.commute.status)}
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Not enrolled in commute.
            </p>
          )}
        </SectionCard>
      </div>

      {isAppLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : (
        <>
          <SectionCard
            title="Contact Information"
            icon={<Mail className="h-3.5 w-3.5" />}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <InfoBox label="Email" value={student.email ?? personal?.email} />
              <InfoBox
                label="Phone Number"
                value={
                  student.phoneNumber
                    ? `${student.phoneCountryCode ?? ""} ${student.phoneNumber}`
                    : personal?.mobile_number
                }
              />
              <InfoBox
                label="Residential Address"
                value={
                  address?.correspondence?.address_line1
                    ? `${address.correspondence.address_line1}, ${address.correspondence.city}`
                    : null
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Personal Details"
            icon={<UserCircle2 className="h-3.5 w-3.5" />}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <InfoBox
                label="Date of Birth"
                value={formatDate(personal?.date_of_birth)}
              />
              <InfoBox label="Gender" value={humanize(personal?.gender)} />
              <InfoBox label="Nationality" value={application?.nationality} />
              <InfoBox
                label="Marital Status"
                value={humanize(personal?.marital_status)}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Identity Information"
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <InfoBox label="Aadhaar Number" value={personal?.aadhar_number} />
              <InfoBox label="Religion" value={personal?.religion} />
              <InfoBox label="Category" value={personal?.category} />
              <InfoBox label="Blood Group" value={personal?.blood_group} />
            </div>
          </SectionCard>

          <SectionCard
            title="Address"
            icon={<MapPin className="h-3.5 w-3.5" />}
          >
            <div className="space-y-4">
              <AddressView
                title="Permanent Address"
                block={address?.permanent}
              />
              <AddressView
                title="Correspondence Address"
                block={address?.correspondence}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Family Details"
            icon={<Users className="h-3.5 w-3.5" />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Father
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <InfoBox label="Name" value={family?.father_name} />
                  <InfoBox label="Phone" value={family?.father_phone} />
                  <InfoBox label="Email" value={family?.father_email} />
                  <InfoBox
                    label="Occupation"
                    value={family?.father_occupation}
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Mother
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <InfoBox label="Name" value={family?.mother_name} />
                  <InfoBox label="Phone" value={family?.mother_phone} />
                  <InfoBox label="Email" value={family?.mother_email} />
                  <InfoBox
                    label="Occupation"
                    value={family?.mother_occupation}
                  />
                </div>
              </div>
              {family?.guardian_name && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Guardian
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <InfoBox label="Name" value={family.guardian_name} />
                    <InfoBox
                      label="Relation"
                      value={family.guardian_relation}
                    />
                    <InfoBox label="Phone" value={family.guardian_phone} />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {declaration?.accepted && (
            <div className="rounded-2xl bg-navy p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                Terms and Conditions Declaration
              </p>
              <p className="mt-2 text-sm text-white/80">
                I hereby declare that all the information provided in this
                application is true, correct and to the best of my knowledge.
                The undersigned confirms that all information being furnished is
                accurate and there is no false/incorrect information which could
                be construed as a suppression of material facts.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  Digital Signature:{" "}
                  <span className="font-semibold text-gold">
                    {student.fullName}
                  </span>
                </span>
                <span className="text-white/70">
                  Date: {formatDate(declaration.date)}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <SectionCard
        title="Support Queries"
        icon={<MessageSquare className="h-3.5 w-3.5" />}
      >
        {student.supportTickets.length === 0 ? (
          <p className="text-xs text-muted-foreground">No queries submitted.</p>
        ) : (
          <div className="space-y-2">
            {student.supportTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/${ticket.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm hover:bg-muted/50"
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

/* ---------- Page ---------- */

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: student, isLoading } = useStudentDetail(studentId ?? null);
  const { data: application, isLoading: isAppLoading } = useApplication(
    student?.enrollment.applicationId ?? "",
  );
  const [tab, setTab] = useState<TabId>("overview");

  if (isLoading || !student) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => router.push("/students")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Student Profile
        </h1>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border">
        <div className="h-1 w-full bg-gold" />
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-serif text-lg font-bold",
                avatarColor(student.id),
              )}
            >
              {initials(student.fullName)}
            </span>
            <div>
              <p className="font-serif text-lg font-bold text-navy">
                {student.fullName}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-gold">
                  #{student.enrollment.enrollmentNumber ?? student.id}
                </span>{" "}
                · {student.enrollment.courseName}
              </p>
              <Badge
                variant="outline"
                className="mt-1 border-gold/40 bg-gold-pale text-[11px] font-medium text-navy"
              >
                Enrolled: {formatDate(student.enrollment.enrolledAt)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusClass(student.status)}>
              {humanize(student.status)}
            </Badge>
            <a
              href={student.email ? `mailto:${student.email}` : undefined}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted",
                !student.email && "pointer-events-none opacity-40",
              )}
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href={
                student.phoneNumber ? `tel:${student.phoneNumber}` : undefined
              }
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted",
                !student.phoneNumber && "pointer-events-none opacity-40",
              )}
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto border-b border-border pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
              tab === t.id
                ? "border-gold bg-gold text-white shadow-sm"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewTab
          student={student}
          application={application}
          isAppLoading={isAppLoading}
        />
      )}
      {tab === "qualifications" && (
        <QualificationsTab
          qualificationDetails={application?.qualificationDetails}
          isLoading={isAppLoading}
        />
      )}
      {tab === "documents" && (
        <DocumentsTab
          student={student}
          application={application}
          isLoading={isAppLoading}
        />
      )}
      {tab === "payments" && <PaymentsTab student={student} />}
    </div>
  );
}
