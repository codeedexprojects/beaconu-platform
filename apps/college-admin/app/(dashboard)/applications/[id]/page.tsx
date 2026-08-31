"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import {
  useApplication,
  useEnrollApplicationCourse,
} from "@/hooks/use-applications";
import { useShortlistCourse } from "@/hooks/use-interviews";
import type {
  ApplicationDetailCourseItem,
  UndergraduateDetailsInput,
  SubjectMarksEntry,
  ResultSummary,
} from "@beaconu/types";

const FORM_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
};

const FORM_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  submitted: "default",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
};

const PAYMENT_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  paid: "default",
};

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

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

function LinkOut({
  href,
  label = "View file",
}: {
  href?: string | null;
  label?: string;
}) {
  if (!href) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-primary hover:underline"
    >
      {label}
    </a>
  );
}

// Generic "list of entries" renderer — each item gets its own bordered
// card of DetailRows, via the caller-supplied renderItem.
function EntryList<T>({
  items,
  emptyLabel,
  renderItem,
}: {
  items: T[] | undefined | null;
  emptyLabel: string;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border bg-muted/20 p-3">
          <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {renderItem(item, i)}
          </div>
        </div>
      ))}
    </div>
  );
}

function SubjectsTable({ subjects }: { subjects: SubjectMarksEntry[] }) {
  if (!subjects || subjects.length === 0) {
    return <p className="text-sm text-muted-foreground">No subjects added.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Pattern</TableHead>
            <TableHead>Theory</TableHead>
            <TableHead>Practical</TableHead>
            <TableHead>Internal</TableHead>
            <TableHead>Max</TableHead>
            <TableHead>Obtained</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((s, i) => (
            <TableRow key={i}>
              <TableCell>{s.subject_name}</TableCell>
              <TableCell>{s.evaluation_pattern || "—"}</TableCell>
              <TableCell>{s.theory_marks ?? "—"}</TableCell>
              <TableCell>{s.practical_marks ?? "—"}</TableCell>
              <TableCell>{s.internal_marks ?? "—"}</TableCell>
              <TableCell>{s.max_marks}</TableCell>
              <TableCell>{s.obtained_marks}</TableCell>
              <TableCell>{s.attempts ?? "—"}</TableCell>
              <TableCell>
                {s.percentage != null ? `${s.percentage}%` : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ResultSummaryRow({ summary }: { summary: ResultSummary | undefined }) {
  if (!summary) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <DetailRow label="Marking Scheme" value={summary.marking_scheme} />
      <DetailRow label="Marks Obtained" value={summary.marks_obtained} />
      <DetailRow label="Max Marks" value={summary.max_marks} />
      <DetailRow
        label="Percentage"
        value={summary.percentage != null ? `${summary.percentage}%` : null}
      />
      {summary.remarks && (
        <div className="sm:col-span-2 lg:col-span-4">
          <DetailRow label="Remarks" value={summary.remarks} />
        </div>
      )}
    </div>
  );
}

// Full field breakdown for a 10th/12th Grade record — shared shape minus
// the 12th-only Class XI fields (passed in optionally).
function SchoolGradeCard({
  title,
  record,
  classXi,
}: {
  title: string;
  record: {
    academic_year: string;
    admission_year: string;
    year_of_passing: number;
    board_name: string;
    registration_number?: string | null;
    school_name: string;
    school_code?: string | null;
    school_address?: string | null;
    school_state: string;
    medium_of_instruction: string;
    subjects: SubjectMarksEntry[];
    result_summary: ResultSummary;
    marksheet_url?: string | null;
  };
  classXi?: {
    has_separate_class_xi_exam: boolean;
    class_xi_status?: "declared" | "undeclared" | null;
  };
  migrationCertificateUrl?: string | null;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Academic Year" value={record.academic_year} />
          <DetailRow label="Admission Year" value={record.admission_year} />
          <DetailRow label="Year of Passing" value={record.year_of_passing} />
          <DetailRow label="Board Name" value={record.board_name} />
          <DetailRow
            label="Registration Number"
            value={record.registration_number}
          />
          <DetailRow label="School Name" value={record.school_name} />
          <DetailRow label="School Code" value={record.school_code} />
          <DetailRow label="School State" value={record.school_state} />
          <DetailRow
            label="Medium of Instruction"
            value={record.medium_of_instruction}
          />
          {record.school_address && (
            <div className="sm:col-span-2 lg:col-span-3">
              <DetailRow label="School Address" value={record.school_address} />
            </div>
          )}
          {classXi && (
            <>
              <DetailRow
                label="Separate Class XI Exam"
                value={classXi.has_separate_class_xi_exam ? "Yes" : "No"}
              />
              {classXi.has_separate_class_xi_exam && (
                <DetailRow
                  label="Class XI Status"
                  value={classXi.class_xi_status}
                />
              )}
            </>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Subjects
          </p>
          <SubjectsTable subjects={record.subjects} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Overall Result
          </p>
          <ResultSummaryRow summary={record.result_summary} />
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Marksheet</p>
            <LinkOut href={record.marksheet_url} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Undergraduate/PG/Diploma are structurally identical — one shared card,
// full field breakdown (not just a summary).
function DegreeLevelCard({
  title,
  record,
}: {
  title: string;
  record: UndergraduateDetailsInput;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Program Type" value={record.program_type} />
          <DetailRow label="Degree Type" value={record.degree_type} />
          <DetailRow label="Program Name" value={record.program_name} />
          <DetailRow label="Specialization" value={record.specialization} />
          <DetailRow label="University" value={record.university_name} />
          <DetailRow label="University Type" value={record.university_type} />
          <DetailRow label="Institution" value={record.institution_name} />
          <DetailRow label="Institution Type" value={record.institution_type} />
          <DetailRow label="Admission Year" value={record.admission_year} />
          <DetailRow label="Passing Year" value={record.passing_year} />
          <DetailRow label="Duration (Years)" value={record.duration_years} />
          <DetailRow label="Register Number" value={record.register_number} />
          <DetailRow label="Academic Cycle" value={record.academic_cycle} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Semester/Year Records
          </p>
          {record.semester_records && record.semester_records.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>CGPA/%</TableHead>
                    <TableHead>Backlogs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {record.semester_records.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell>{s.label}</TableCell>
                      <TableCell>{s.duration ?? "—"}</TableCell>
                      <TableCell>{s.gpa ?? "—"}</TableCell>
                      <TableCell>{s.cgpa_or_percentage ?? "—"}</TableCell>
                      <TableCell>{s.backlogs ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No semester/year records added.
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Final Academic Summary
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailRow
              label="Total Credits"
              value={record.final_summary?.total_credits}
            />
            <DetailRow label="CGPA" value={record.final_summary?.cgpa} />
            <DetailRow
              label="Percentage"
              value={
                record.final_summary?.percentage != null
                  ? `${record.final_summary.percentage}%`
                  : null
              }
            />
            <DetailRow label="Rank" value={record.final_summary?.rank} />
            <DetailRow
              label="Total Backlogs"
              value={record.final_summary?.total_backlogs}
            />
            <DetailRow
              label="Result Status"
              value={record.final_summary?.result_status}
            />
            {record.final_summary?.remarks && (
              <div className="sm:col-span-2 lg:col-span-4">
                <DetailRow
                  label="Remarks"
                  value={record.final_summary.remarks}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Documents
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Degree Certificate
              </p>
              <LinkOut href={record.documents?.degree_certificate_url} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Provisional Certificate
              </p>
              <LinkOut href={record.documents?.provisional_certificate_url} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Consolidated Mark Sheet
              </p>
              <LinkOut href={record.documents?.consolidated_mark_sheet_url} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Semester Mark Sheets
              </p>
              {record.documents?.semester_mark_sheet_urls?.length ? (
                <div className="space-y-1">
                  {record.documents.semester_mark_sheet_urls.map((url, i) => (
                    <div key={i}>
                      <LinkOut href={url} label={`Sheet ${i + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Projects
          </p>
          {record.has_projects ? (
            <EntryList
              items={record.projects}
              emptyLabel="No projects added."
              renderItem={(p) => (
                <>
                  <DetailRow label="Title" value={p.title} />
                  <DetailRow label="Type" value={p.project_type} />
                  <DetailRow label="Duration" value={p.duration} />
                  <DetailRow label="Team Size" value={p.team_size} />
                  <DetailRow label="Role" value={p.role} />
                  {p.project_url && (
                    <div>
                      <p className="text-xs text-muted-foreground">Link</p>
                      <LinkOut href={p.project_url} label="Open project" />
                    </div>
                  )}
                  {p.description && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <DetailRow label="Description" value={p.description} />
                    </div>
                  )}
                  {p.key_outcomes && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <DetailRow label="Key Outcomes" value={p.key_outcomes} />
                    </div>
                  )}
                </>
              )}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No projects completed during this program.
            </p>
          )}
        </div>
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

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const queryClient = useQueryClient();
  const { data: app, isLoading, error } = useApplication(id);
  const enrollMutation = useEnrollApplicationCourse(id);
  const [enrollTarget, setEnrollTarget] =
    useState<ApplicationDetailCourseItem | null>(null);

  function confirmEnroll() {
    if (!enrollTarget) return;
    enrollMutation.mutate(enrollTarget.id, {
      onSuccess: () => {
        toast.success(`"${enrollTarget.courseName}" enrolled`);
        setEnrollTarget(null);
      },
    });
  }

  const shortlistMutation = useShortlistCourse();
  const [shortlistTarget, setShortlistTarget] =
    useState<ApplicationDetailCourseItem | null>(null);
  const [shortlistFile, setShortlistFile] = useState<File | null>(null);
  const [shortlistValidUntil, setShortlistValidUntil] = useState("");
  const [isUploadingOffer, setIsUploadingOffer] = useState(false);

  function closeShortlistDialog() {
    setShortlistTarget(null);
    setShortlistFile(null);
    setShortlistValidUntil("");
  }

  async function confirmShortlist() {
    if (!shortlistTarget || !shortlistFile || !shortlistValidUntil) {
      toast.error("Select the offer letter document and its valid-until date");
      return;
    }
    setIsUploadingOffer(true);
    try {
      const documentUrl = await uploadCollegeAdminFile(
        shortlistFile,
        "applications/offer-letters",
      );
      shortlistMutation.mutate(
        {
          applicationCourseId: shortlistTarget.id,
          data: { document_url: documentUrl, valid_until: shortlistValidUntil },
        },
        {
          onSuccess: () => {
            toast.success(`"${shortlistTarget.courseName}" shortlisted`);
            void queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.application(id),
            });
            closeShortlistDialog();
          },
        },
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploadingOffer(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border p-5">
              <Skeleton className="mb-4 h-4 w-32" />
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

  if (error || !app) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">Application not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const correspondence = app.addressDetails.correspondence;
  const permanent = app.addressDetails.same_as_correspondence
    ? correspondence
    : app.addressDetails.permanent;
  const {
    tenth_grade: tenthGrade,
    twelfth_grade: twelfthGrade,
    undergraduate,
    pg,
    diploma,
  } = app.qualificationDetails;
  const achievements = app.achievementsDetails;
  const entranceExam = app.entranceExamDetails;

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
            {app.applicationNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            {app.studentName} · {app.admissionCycleName}
            {app.campusName ? ` · ${app.campusName}` : ""}
          </p>
        </div>
        <Badge variant={FORM_STATUS_VARIANTS[app.formStatus] ?? "secondary"}>
          {FORM_STATUS_LABELS[app.formStatus] ?? app.formStatus}
        </Badge>
        <Badge
          variant={PAYMENT_STATUS_VARIANTS[app.feePaymentStatus] ?? "secondary"}
        >
          {PAYMENT_STATUS_LABELS[app.feePaymentStatus] ?? app.feePaymentStatus}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Student & application meta */}
        <Section title="Student">
          <DetailRow label="Full Name" value={app.studentName} />
          <DetailRow
            label="Email"
            value={
              app.studentEmail && (
                <a
                  href={`mailto:${app.studentEmail}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {app.studentEmail}
                </a>
              )
            }
          />
          <DetailRow
            label="Phone"
            value={
              app.studentPhone && (
                <a
                  href={`tel:${app.studentPhone}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {app.studentPhone}
                </a>
              )
            }
          />
          <DetailRow
            label="WhatsApp"
            value={
              app.whatsappNumber
                ? `${app.whatsappCountryCode ?? ""} ${app.whatsappNumber}`
                : null
            }
          />
          {app.profilePhotoUrl && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                Profile Photo
              </p>
              <img
                src={app.profilePhotoUrl}
                alt="Profile"
                className="h-20 w-20 rounded-md border object-cover"
              />
            </div>
          )}
        </Section>

        <Section title="Application">
          <DetailRow label="Nationality" value={app.nationality} />
          <DetailRow label="State of Domicile" value={app.stateOfDomicile} />
          {app.passportNumber && (
            <DetailRow
              label="Passport"
              value={`${app.passportCountry ?? ""} · ${app.passportNumber}`}
            />
          )}
          <DetailRow
            label="Total Application Fee"
            value={`₹${app.totalApplicationFee}`}
          />
          <DetailRow
            label="Submitted"
            value={formatDateTime(app.submittedAt)}
          />
          <DetailRow label="Created" value={formatDateTime(app.createdAt)} />
        </Section>

        {/* Personal details */}
        <Section title="Personal Details">
          <DetailRow label="Full Name" value={app.personalDetails.full_name} />
          <DetailRow
            label="Date of Birth"
            value={app.personalDetails.date_of_birth}
          />
          <DetailRow label="Gender" value={app.personalDetails.gender} />
          <DetailRow label="Category" value={app.personalDetails.category} />
          <DetailRow
            label="Blood Group"
            value={app.personalDetails.blood_group}
          />
          <DetailRow label="Religion" value={app.personalDetails.religion} />
          <DetailRow
            label="Mother Tongue"
            value={app.personalDetails.mother_tongue}
          />
          <DetailRow
            label="Marital Status"
            value={app.personalDetails.marital_status}
          />
          <DetailRow
            label="Aadhar Number"
            value={app.personalDetails.aadhar_number}
          />
          <DetailRow label="Email" value={app.personalDetails.email} />
          <DetailRow
            label="Mobile"
            value={
              app.personalDetails.mobile_number
                ? `${app.personalDetails.mobile_country_code ?? ""} ${app.personalDetails.mobile_number}`
                : null
            }
          />
        </Section>

        {/* Family details */}
        <Section title="Family Details">
          <DetailRow
            label="Father's Name"
            value={app.familyDetails.father_name}
          />
          <DetailRow
            label="Father's Occupation"
            value={app.familyDetails.father_occupation}
          />
          <DetailRow
            label="Father's Contact"
            value={
              [app.familyDetails.father_phone, app.familyDetails.father_email]
                .filter(Boolean)
                .join(" · ") || null
            }
          />
          <DetailRow
            label="Mother's Name"
            value={app.familyDetails.mother_name}
          />
          <DetailRow
            label="Mother's Occupation"
            value={app.familyDetails.mother_occupation}
          />
          <DetailRow
            label="Mother's Contact"
            value={
              [app.familyDetails.mother_phone, app.familyDetails.mother_email]
                .filter(Boolean)
                .join(" · ") || null
            }
          />
          {app.familyDetails.guardian_name && (
            <DetailRow
              label="Guardian"
              value={`${app.familyDetails.guardian_name} (${app.familyDetails.guardian_relation ?? "—"}) · ${app.familyDetails.guardian_phone ?? "—"}`}
            />
          )}
          <DetailRow
            label="Annual Family Income"
            value={
              app.familyDetails.annual_family_income != null
                ? `₹${app.familyDetails.annual_family_income}`
                : null
            }
          />
          <DetailRow
            label="Number of Siblings"
            value={app.familyDetails.number_of_siblings}
          />
        </Section>

        {/* Address details */}
        <Section title="Address">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Correspondence Address
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <DetailRow
                label="Address Line 1"
                value={correspondence?.address_line1}
              />
              <DetailRow
                label="Address Line 2"
                value={correspondence?.address_line2}
              />
              <DetailRow label="City" value={correspondence?.city} />
              <DetailRow label="District" value={correspondence?.district} />
              <DetailRow label="State" value={correspondence?.state} />
              <DetailRow label="PIN Code" value={correspondence?.pin_code} />
              <DetailRow label="Country" value={correspondence?.country} />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Permanent Address
              {app.addressDetails.same_as_correspondence &&
                " (same as correspondence)"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <DetailRow
                label="Address Line 1"
                value={permanent?.address_line1}
              />
              <DetailRow
                label="Address Line 2"
                value={permanent?.address_line2}
              />
              <DetailRow label="City" value={permanent?.city} />
              <DetailRow label="District" value={permanent?.district} />
              <DetailRow label="State" value={permanent?.state} />
              <DetailRow label="PIN Code" value={permanent?.pin_code} />
              <DetailRow label="Country" value={permanent?.country} />
            </div>
          </div>
        </Section>

        {/* Declaration */}
        <Section title="Declaration">
          <DetailRow
            label="Accepted"
            value={app.declaration.accepted ? "Yes" : "No"}
          />
          <DetailRow
            label="Signature"
            value={
              <LinkOut
                href={app.declaration.signature_url}
                label="View signature"
              />
            }
          />
          <DetailRow label="Place" value={app.declaration.place} />
          <DetailRow
            label="Date"
            value={
              app.declaration.date ? formatDate(app.declaration.date) : null
            }
          />
        </Section>
      </div>

      {/* Academic Records */}
      <Section title="Academic Records">
        {!tenthGrade && !twelfthGrade && !undergraduate && !pg && !diploma ? (
          <p className="text-sm text-muted-foreground">
            No academic records added yet.
          </p>
        ) : (
          <div className="space-y-4">
            {tenthGrade && (
              <SchoolGradeCard title="10th Grade" record={tenthGrade} />
            )}
            {twelfthGrade && (
              <SchoolGradeCard
                title="12th Grade"
                record={twelfthGrade}
                classXi={{
                  has_separate_class_xi_exam:
                    twelfthGrade.has_separate_class_xi_exam,
                  class_xi_status: twelfthGrade.class_xi_status,
                }}
              />
            )}
            {twelfthGrade?.migration_certificate_url && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Migration Certificate (12th)
                </p>
                <LinkOut href={twelfthGrade.migration_certificate_url} />
              </div>
            )}
            {undergraduate && (
              <DegreeLevelCard title="Undergraduate" record={undergraduate} />
            )}
            {pg && <DegreeLevelCard title="PG" record={pg} />}
            {diploma && <DegreeLevelCard title="Diploma" record={diploma} />}
          </div>
        )}
      </Section>

      {/* Achievements & Extracurricular */}
      <Section title="Achievements & Extracurricular">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Internships
            </p>
            <EntryList
              items={achievements.internships}
              emptyLabel="No internships added."
              renderItem={(i) => (
                <>
                  <DetailRow label="Company" value={i.company_name} />
                  <DetailRow label="Role" value={i.role} />
                  <DetailRow
                    label="Duration"
                    value={
                      [formatDate(i.start_date), formatDate(i.end_date)]
                        .filter((v) => v !== "—")
                        .join(" – ") || null
                    }
                  />
                  {i.key_responsibilities && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <DetailRow
                        label="Key Responsibilities"
                        value={i.key_responsibilities}
                      />
                    </div>
                  )}
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Work Experience
            </p>
            <DetailRow
              label="Has Prior Work Experience"
              value={achievements.has_work_experience ? "Yes" : "No"}
            />
            {achievements.has_work_experience && (
              <div className="mt-2">
                <EntryList
                  items={achievements.work_experience}
                  emptyLabel="No work experience entries added."
                  renderItem={(w) => (
                    <>
                      <DetailRow label="Company" value={w.company_name} />
                      <DetailRow label="Job Title" value={w.job_title} />
                      <DetailRow label="Industry" value={w.industry} />
                      <DetailRow
                        label="Employment Type"
                        value={w.employment_type}
                      />
                      <DetailRow
                        label="Total Experience"
                        value={w.total_experience}
                      />
                    </>
                  )}
                />
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Languages
            </p>
            <EntryList
              items={achievements.languages}
              emptyLabel="No languages added."
              renderItem={(l) => (
                <>
                  <DetailRow label="Language" value={l.language} />
                  <DetailRow label="Proficiency" value={l.proficiency} />
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Academic Awards
            </p>
            <EntryList
              items={achievements.academic_awards}
              emptyLabel="No academic awards added."
              renderItem={(a) => (
                <>
                  <DetailRow label="Title" value={a.title} />
                  <DetailRow label="Year" value={a.year} />
                  <DetailRow label="Issuing Body" value={a.issuing_body} />
                  <div>
                    <p className="text-xs text-muted-foreground">Proof</p>
                    <LinkOut href={a.proof_url} />
                  </div>
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sports Achievements
            </p>
            <EntryList
              items={achievements.sports_achievements}
              emptyLabel="No sports achievements added."
              renderItem={(s) => (
                <>
                  <DetailRow label="Sport" value={s.sport_name} />
                  <DetailRow
                    label="Competition Level"
                    value={s.competition_level}
                  />
                  <DetailRow
                    label="Position Secured"
                    value={s.position_secured}
                  />
                  <DetailRow label="Year" value={s.achievement_year} />
                  <div>
                    <p className="text-xs text-muted-foreground">Certificate</p>
                    <LinkOut href={s.certificate_url} />
                  </div>
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Arts &amp; Cultural Achievements
            </p>
            <EntryList
              items={achievements.arts_cultural_achievements}
              emptyLabel="No arts & cultural achievements added."
              renderItem={(a) => (
                <>
                  <DetailRow label="Category" value={a.category} />
                  <DetailRow
                    label="Competition Name"
                    value={a.competition_name}
                  />
                  <DetailRow
                    label="Achievement Level"
                    value={a.achievement_level}
                  />
                  <DetailRow
                    label="Position Secured"
                    value={a.position_secured}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Certificate</p>
                    <LinkOut href={a.certificate_url} />
                  </div>
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Hobbies &amp; Interests
            </p>
            <DetailRow
              label="Hobbies"
              value={achievements.hobbies?.join(", ")}
            />
            <DetailRow
              label="Other Interests"
              value={achievements.other_interests}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Publications
            </p>
            <EntryList
              items={achievements.publications}
              emptyLabel="No publications added."
              renderItem={(p) => (
                <>
                  <DetailRow label="Title" value={p.title} />
                  <DetailRow
                    label="Journal/Publisher"
                    value={p.journal_publisher}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Link</p>
                    <LinkOut href={p.url} label="Open publication" />
                  </div>
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Patent Details
            </p>
            <EntryList
              items={achievements.patents}
              emptyLabel="No patents added."
              renderItem={(p) => (
                <>
                  <DetailRow label="Title" value={p.title} />
                  <DetailRow label="Patent Number" value={p.patent_number} />
                  <DetailRow label="Status" value={p.status} />
                  <DetailRow
                    label="Filing Date"
                    value={formatDate(p.filing_date)}
                  />
                  <DetailRow label="Patent Office" value={p.patent_office} />
                  <DetailRow label="Co-Inventors" value={p.co_inventors} />
                  <div>
                    <p className="text-xs text-muted-foreground">Document</p>
                    <LinkOut href={p.document_url} />
                  </div>
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Professional Certifications
            </p>
            <EntryList
              items={achievements.professional_certifications}
              emptyLabel="No certifications added."
              renderItem={(c) => (
                <>
                  <DetailRow label="Name" value={c.name} />
                  <DetailRow
                    label="Issuing Authority"
                    value={c.issuing_authority}
                  />
                  <DetailRow
                    label="Certification ID"
                    value={c.certification_id}
                  />
                  <DetailRow
                    label="Issue Date"
                    value={formatDate(c.issue_date)}
                  />
                  <DetailRow
                    label="Expiry Date"
                    value={formatDate(c.expiry_date)}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Verification
                    </p>
                    <LinkOut href={c.verification_url} label="Verify" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Certificate</p>
                    <LinkOut href={c.certificate_url} />
                  </div>
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Portfolio &amp; Profile Links
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">LinkedIn</p>
                <LinkOut href={achievements.portfolio_links?.linkedin_url} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">GitHub</p>
                <LinkOut href={achievements.portfolio_links?.github_url} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ResearchGate</p>
                <LinkOut
                  href={achievements.portfolio_links?.researchgate_url}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Google Scholar</p>
                <LinkOut
                  href={achievements.portfolio_links?.google_scholar_url}
                />
              </div>
              <DetailRow
                label="ORCID ID"
                value={achievements.portfolio_links?.orcid_id}
              />
              <div>
                <p className="text-xs text-muted-foreground">
                  Personal Website
                </p>
                <LinkOut
                  href={achievements.portfolio_links?.personal_website_url}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Behance</p>
                <LinkOut href={achievements.portfolio_links?.behance_url} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dribbble</p>
                <LinkOut href={achievements.portfolio_links?.dribbble_url} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kaggle</p>
                <LinkOut href={achievements.portfolio_links?.kaggle_url} />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommendation Letters
            </p>
            <EntryList
              items={achievements.recommendation_letters}
              emptyLabel="No recommendation letters uploaded."
              renderItem={(r, i) => (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Letter {i + 1}
                  </p>
                  <LinkOut href={r.document_url} />
                </div>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Innovation &amp; Entrepreneurship
            </p>
            <EntryList
              items={achievements.innovation_entrepreneurship}
              emptyLabel="No innovation/entrepreneurship entries added."
              renderItem={(e) => (
                <>
                  <DetailRow label="Startup Name" value={e.startup_name} />
                  <DetailRow label="Role" value={e.role} />
                  <DetailRow
                    label="Incubation Support"
                    value={e.incubation_support}
                  />
                  <DetailRow
                    label="DPIIT Registration No."
                    value={e.dpiit_registration_number}
                  />
                  {e.contribution && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <DetailRow label="Contribution" value={e.contribution} />
                    </div>
                  )}
                </>
              )}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Volunteering &amp; Social Service
            </p>
            <EntryList
              items={achievements.volunteering}
              emptyLabel="No volunteering entries added."
              renderItem={(v) => (
                <>
                  <DetailRow label="Organization" value={v.organization_name} />
                  <DetailRow label="Role" value={v.role} />
                  <DetailRow
                    label="Duration"
                    value={
                      [formatDate(v.start_date), formatDate(v.end_date)]
                        .filter((val) => val !== "—")
                        .join(" – ") || null
                    }
                  />
                  {v.description && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <DetailRow label="Description" value={v.description} />
                    </div>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </Section>

      {/* Competitive Exam Records */}
      <Section title="Competitive Exam Records">
        <DetailRow
          label="Attempted Entrance Exam"
          value={entranceExam.has_attempted_entrance_exam ? "Yes" : "No"}
        />
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Exam Records
          </p>
          <EntryList
            items={entranceExam.exams}
            emptyLabel="No exam records added."
            renderItem={(exam) => (
              <>
                <DetailRow label="Exam Name" value={exam.exam_name} />
                <DetailRow
                  label="Year of Appearance"
                  value={exam.year_of_appearance}
                />
                <DetailRow label="Roll Number" value={exam.roll_number} />
                <DetailRow
                  label="Score/Percentile"
                  value={exam.score_or_percentile}
                />
                <div>
                  <p className="text-xs text-muted-foreground">Mark Card</p>
                  <LinkOut href={exam.mark_card_url} />
                </div>
              </>
            )}
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommendation Letters
          </p>
          <EntryList
            items={entranceExam.recommendation_letters}
            emptyLabel="No recommendation letters uploaded."
            renderItem={(r, i) => (
              <div>
                <p className="text-xs text-muted-foreground">Letter {i + 1}</p>
                <LinkOut href={r.document_url} />
              </div>
            )}
          />
        </div>
      </Section>

      {/* Courses */}
      <Section title="Courses & Fees">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Primary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quota</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {app.courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No courses selected.
                </TableCell>
              </TableRow>
            ) : (
              app.courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium">{c.courseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.courseCode}
                    </p>
                  </TableCell>
                  <TableCell>{c.isPrimary ? "Yes" : "—"}</TableCell>
                  <TableCell className="capitalize">
                    {c.status.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>{c.quotaName ?? "—"}</TableCell>
                  <TableCell>₹{c.applicationFee}</TableCell>
                  <TableCell className="text-right">
                    {c.status === "submitted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShortlistTarget(c)}
                      >
                        Shortlist
                      </Button>
                    )}
                    {c.status === "token_paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEnrollTarget(c)}
                      >
                        Mark Enrolled
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Section>

      {/* Documents */}
      <Section title="Documents">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Verification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {app.documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No documents uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              app.documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="capitalize">
                    {d.documentType.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {d.documentCategory.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {d.fileName ?? "View file"}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        d.verificationStatus === "approved"
                          ? "default"
                          : d.verificationStatus === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {d.verificationStatus}
                    </Badge>
                    {d.rejectionReason && (
                      <p className="mt-1 text-xs text-destructive">
                        {d.rejectionReason}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Section>

      {/* Payments */}
      <Section title="Payments">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fee</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transactions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {app.payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No payments yet.
                </TableCell>
              </TableRow>
            ) : (
              app.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium capitalize">
                      {p.feeCategory.replace(/_/g, " ")}
                    </p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{p.courseName ?? "—"}</TableCell>
                  <TableCell>₹{p.netAmount}</TableCell>
                  <TableCell>₹{p.paidAmount}</TableCell>
                  <TableCell>₹{p.balanceAmount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "paid"
                          ? "default"
                          : p.status === "overdue"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.transactions.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="space-y-1.5">
                        {p.transactions.map((t) => (
                          <div key={t.id} className="text-xs">
                            <span className="font-medium">
                              {t.transactionNumber}
                            </span>{" "}
                            · {t.paymentMethod} ·{" "}
                            <Badge
                              variant={
                                t.status === "completed"
                                  ? "default"
                                  : t.status === "failed" ||
                                      t.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {t.status}
                            </Badge>
                            {t.providerPaymentId && (
                              <p className="text-muted-foreground">
                                {t.providerPaymentId}
                              </p>
                            )}
                            <p className="text-muted-foreground">
                              {formatDateTime(t.paidAt ?? t.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Section>

      <ConfirmDialog
        open={enrollTarget !== null}
        title="Mark Enrolled"
        description={
          enrollTarget
            ? `Enroll "${enrollTarget.courseName}"? This decrements the course's quota seat count and cannot be undone.`
            : ""
        }
        confirmLabel="Enroll"
        loading={enrollMutation.isPending}
        onCancel={() => setEnrollTarget(null)}
        onConfirm={confirmEnroll}
      />

      <Dialog
        open={shortlistTarget !== null}
        onOpenChange={(open) => !open && closeShortlistDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Shortlist &quot;{shortlistTarget?.courseName}&quot;
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Skips straight to shortlisted from the current status (
              {shortlistTarget?.status.replace(/_/g, " ")}) and issues the offer
              letter. Only allowed if this course&apos;s admission cycle
              doesn&apos;t require an assessment or interview at this stage —
              otherwise the server will reject it.
            </p>
            <div>
              <Label>Offer Letter Document</Label>
              <Input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setShortlistFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <Label>Offer Valid Until</Label>
              <Input
                type="date"
                value={shortlistValidUntil}
                onChange={(e) => setShortlistValidUntil(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeShortlistDialog}>
              Cancel
            </Button>
            <Button
              disabled={isUploadingOffer || shortlistMutation.isPending}
              onClick={confirmShortlist}
            >
              {(isUploadingOffer || shortlistMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm Shortlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
