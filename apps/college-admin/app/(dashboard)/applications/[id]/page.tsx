"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  useApplication,
  useEnrollApplicationCourse,
} from "@/hooks/use-applications";
import type { ApplicationDetailCourseItem } from "@beaconu/types";

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
  } = app.qualificationDetails;

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
              value={`${app.familyDetails.guardian_name} (${app.familyDetails.guardian_relation ?? "—"})`}
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
            <p className="text-sm font-medium">
              {correspondence
                ? [
                    correspondence.address_line1,
                    correspondence.address_line2,
                    correspondence.city,
                    correspondence.state,
                    correspondence.pin_code,
                    correspondence.country,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "—"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Permanent Address
              {app.addressDetails.same_as_correspondence &&
                " (same as correspondence)"}
            </p>
            <p className="text-sm font-medium">
              {permanent
                ? [
                    permanent.address_line1,
                    permanent.address_line2,
                    permanent.city,
                    permanent.state,
                    permanent.pin_code,
                    permanent.country,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "—"}
            </p>
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
              app.declaration.signature_url && (
                <a
                  href={app.declaration.signature_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View signature
                </a>
              )
            }
          />
          <DetailRow label="Place" value={app.declaration.place} />
          <DetailRow
            label="Date"
            value={
              app.declaration.date ? formatDateTime(app.declaration.date) : null
            }
          />
        </Section>

        {/* Competitive Exam Records */}
        <Section title="Competitive Exam Records">
          <DetailRow
            label="Attempted Entrance Exam"
            value={
              app.entranceExamDetails.has_attempted_entrance_exam ? "Yes" : "No"
            }
          />
          {(app.entranceExamDetails.exams ?? []).map((exam, i) => (
            <DetailRow
              key={i}
              label={exam.exam_name}
              value={
                [exam.year_of_appearance, exam.score_or_percentile]
                  .filter(Boolean)
                  .join(" · ") || "—"
              }
            />
          ))}
          <DetailRow
            label="Recommendation Letters"
            value={
              app.entranceExamDetails.recommendation_letters?.length || null
            }
          />
        </Section>

        {/* Achievements & Extracurricular */}
        <Section title="Achievements & Extracurricular">
          <DetailRow
            label="Internships"
            value={app.achievementsDetails.internships?.length || null}
          />
          <DetailRow
            label="Work Experience"
            value={
              app.achievementsDetails.has_work_experience
                ? `${app.achievementsDetails.work_experience?.length ?? 0} entr${
                    app.achievementsDetails.work_experience?.length === 1
                      ? "y"
                      : "ies"
                  }`
                : "None"
            }
          />
          <DetailRow
            label="Languages"
            value={app.achievementsDetails.languages
              ?.map((l) => l.language)
              .join(", ")}
          />
          <DetailRow
            label="Awards"
            value={
              (app.achievementsDetails.academic_awards?.length ?? 0) +
                (app.achievementsDetails.sports_achievements?.length ?? 0) +
                (app.achievementsDetails.arts_cultural_achievements?.length ??
                  0) || null
            }
          />
          <DetailRow
            label="Hobbies"
            value={app.achievementsDetails.hobbies?.join(", ")}
          />
          <DetailRow
            label="Publications"
            value={app.achievementsDetails.publications?.length || null}
          />
          <DetailRow
            label="Patents"
            value={app.achievementsDetails.patents?.length || null}
          />
          <DetailRow
            label="Certifications"
            value={
              app.achievementsDetails.professional_certifications?.length ||
              null
            }
          />
          <DetailRow
            label="LinkedIn"
            value={app.achievementsDetails.portfolio_links?.linkedin_url}
          />
          <DetailRow
            label="GitHub"
            value={app.achievementsDetails.portfolio_links?.github_url}
          />
          <DetailRow
            label="Recommendation Letters"
            value={
              app.achievementsDetails.recommendation_letters?.length || null
            }
          />
          <DetailRow
            label="Innovation / Entrepreneurship"
            value={
              app.achievementsDetails.innovation_entrepreneurship?.length ||
              null
            }
          />
          <DetailRow
            label="Volunteering"
            value={app.achievementsDetails.volunteering?.length || null}
          />
        </Section>
      </div>

      {/* Academic Records */}
      <Section title="Academic Records">
        {!tenthGrade && !twelfthGrade && !undergraduate ? (
          <p className="text-sm text-muted-foreground">
            No academic records added yet.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {tenthGrade && (
              <div className="rounded-lg border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  10th Grade
                </p>
                <DetailRow label="Board" value={tenthGrade.board_name} />
                <DetailRow label="School" value={tenthGrade.school_name} />
                <DetailRow
                  label="Year of Passing"
                  value={tenthGrade.year_of_passing}
                />
                <DetailRow
                  label="Result"
                  value={
                    tenthGrade.result_summary?.percentage != null
                      ? `${tenthGrade.result_summary.percentage}%`
                      : (tenthGrade.result_summary?.marks_obtained ?? null)
                  }
                />
              </div>
            )}
            {twelfthGrade && (
              <div className="rounded-lg border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  12th Grade
                </p>
                <DetailRow label="Board" value={twelfthGrade.board_name} />
                <DetailRow label="School" value={twelfthGrade.school_name} />
                <DetailRow
                  label="Year of Passing"
                  value={twelfthGrade.year_of_passing}
                />
                <DetailRow
                  label="Result"
                  value={
                    twelfthGrade.result_summary?.percentage != null
                      ? `${twelfthGrade.result_summary.percentage}%`
                      : (twelfthGrade.result_summary?.marks_obtained ?? null)
                  }
                />
              </div>
            )}
            {undergraduate && (
              <div className="rounded-lg border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Undergraduate
                </p>
                <DetailRow label="Program" value={undergraduate.program_name} />
                <DetailRow
                  label="University"
                  value={undergraduate.university_name}
                />
                <DetailRow
                  label="Result"
                  value={
                    undergraduate.final_summary?.cgpa != null
                      ? `CGPA ${undergraduate.final_summary.cgpa}`
                      : undergraduate.final_summary?.percentage != null
                        ? `${undergraduate.final_summary.percentage}%`
                        : null
                  }
                />
                <DetailRow
                  label="Backlogs"
                  value={undergraduate.final_summary?.total_backlogs}
                />
              </div>
            )}
          </div>
        )}
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
    </div>
  );
}
