import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, Calendar, Globe, BookOpen, Users } from "lucide-react";
import { getEntranceExamById } from "@/lib/services/entrance-exams.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  national: { bg: "#EFF6FF", text: "#1D4ED8" },
  state: { bg: "#F0FDF4", text: "#15803D" },
  university: { bg: "#FFF7ED", text: "#C2410C" },
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const exam = await getEntranceExamById(id);
    return {
      title: `${exam.name} | BeaconU`,
      description: exam.description ?? `Information about ${exam.name}.`,
    };
  } catch {
    return { title: "Entrance Exam | BeaconU" };
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">
        {label}
      </span>
      <span className="text-[14px] text-gray-800 font-medium">{value}</span>
    </div>
  );
}

export default async function EntranceExamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const exam = await getEntranceExamById(id).catch(() => null);

  if (!exam || exam.status !== "active") notFound();

  const levelColor = LEVEL_COLORS[exam.examLevel] ?? LEVEL_COLORS.national;
  const courses = Array.isArray(exam.applicableCourses)
    ? exam.applicableCourses
    : [];

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <Link
            href="/entrance-exams"
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#E8521A] hover:text-[#E8521A] hover:bg-[#FEF0EB] transition-colors shrink-0"
            aria-label="Back"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-[15px] font-semibold text-gray-800 line-clamp-1">
            {exam.name}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* Hero block */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF0EB] flex items-center justify-center shrink-0">
              <GraduationCap size={28} color="#E8521A" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full"
                  style={{ background: levelColor.bg, color: levelColor.text }}
                >
                  {exam.examLevel}
                </span>
                <span className="text-[12px] font-mono font-semibold text-gray-400">
                  {exam.code}
                </span>
              </div>
              <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
                {exam.name}
              </h1>
              {exam.conductingBody && (
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Conducted by {exam.conductingBody}
                </p>
              )}
            </div>
          </div>

          {exam.description && (
            <p className="mt-4 text-[14px] text-gray-600 leading-relaxed whitespace-pre-line">
              {exam.description}
            </p>
          )}
        </div>

        {/* Important dates */}
        {(exam.registrationStart ||
          exam.registrationEnd ||
          exam.examDate ||
          exam.resultDate) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} color="#E8521A" />
              <h2 className="text-[15px] font-bold text-gray-900">
                Important Dates
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {exam.registrationStart && (
                <InfoRow
                  label="Registration Opens"
                  value={formatDate(exam.registrationStart)}
                />
              )}
              {exam.registrationEnd && (
                <InfoRow
                  label="Registration Closes"
                  value={formatDate(exam.registrationEnd)}
                />
              )}
              {exam.examDate && (
                <InfoRow label="Exam Date" value={formatDate(exam.examDate)} />
              )}
              {exam.resultDate && (
                <InfoRow
                  label="Result Date"
                  value={formatDate(exam.resultDate)}
                />
              )}
            </div>
          </div>
        )}

        {/* Eligibility */}
        {exam.eligibility && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} color="#E8521A" />
              <h2 className="text-[15px] font-bold text-gray-900">
                Eligibility
              </h2>
            </div>
            <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-line">
              {exam.eligibility}
            </p>
          </div>
        )}

        {/* Applicable courses */}
        {courses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} color="#E8521A" />
              <h2 className="text-[15px] font-bold text-gray-900">
                Applicable Courses
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => (
                <span
                  key={c}
                  className="text-[13px] text-gray-700 bg-gray-100 px-3 py-1 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Official website */}
        {exam.officialWebsite && (
          <a
            href={exam.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF0EB] flex items-center justify-center">
                <Globe size={18} color="#E8521A" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">
                  Official Website
                </p>
                <p className="text-[12px] text-[#E8521A] truncate max-w-xs">
                  {exam.officialWebsite.replace(/^https?:\/\//, "")}
                </p>
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E8521A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 group-hover:translate-x-0.5 transition-transform"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
            </svg>
          </a>
        )}
      </div>
    </main>
  );
}
