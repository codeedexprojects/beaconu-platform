import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Calendar, Globe, ChevronRight } from "lucide-react";
import { BlogHeader } from "@/components/blogs/BlogHeader";
import { getActiveEntranceExams } from "@/lib/services/entrance-exams.service";
import type { EntranceExamListItem } from "@beaconu/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrance Exams | BeaconU",
  description:
    "Browse national and state level entrance exam information, dates, and eligibility.",
  robots: { index: true, follow: true },
};

const LEVEL_TABS = [
  { label: "All", value: "" },
  { label: "National", value: "national" },
  { label: "State", value: "state" },
  { label: "University", value: "university" },
] as const;

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  national: { bg: "#EFF6FF", text: "#1D4ED8" },
  state: { bg: "#F0FDF4", text: "#15803D" },
  university: { bg: "#FFF7ED", text: "#C2410C" },
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; level?: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EntranceExamsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search ?? "";
  const level = params.level ?? "";

  const { data: exams, meta } = await getActiveEntranceExams({
    page,
    limit: 12,
    search: search || undefined,
    exam_level: level || undefined,
  }).catch(() => ({
    data: [],
    meta: { total: 0, page: 1, limit: 12, hasNext: false },
  }));

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <BlogHeader backHref="/home" backLabel="Home" title="Entrance Exams">
        <div
          className="flex gap-0 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {LEVEL_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/entrance-exams?${new URLSearchParams({
                ...(tab.value ? { level: tab.value } : {}),
                ...(search ? { search } : {}),
              }).toString()}`}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                level === tab.value
                  ? "border-[#E8521A] text-[#E8521A]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </BlogHeader>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
        {exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF0EB] flex items-center justify-center">
              <GraduationCap size={28} color="#E8521A" strokeWidth={1.8} />
            </div>
            <p className="text-[16px] font-bold text-gray-900">
              No exams found
            </p>
            <p className="text-[13px] text-gray-500 text-center max-w-xs">
              {search
                ? "No exams match your search. Try a different term."
                : "No entrance exam information has been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}

        {(page > 1 || meta.hasNext) && (
          <div className="mt-8 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={`/entrance-exams?page=${page - 1}${level ? `&level=${level}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="h-10 px-5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors flex items-center gap-1.5"
              >
                ← Previous
              </Link>
            )}
            <span className="text-[13px] text-gray-400 px-2">Page {page}</span>
            {meta.hasNext && (
              <Link
                href={`/entrance-exams?page=${page + 1}${level ? `&level=${level}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="h-10 px-5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors flex items-center gap-1.5"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function ExamCard({ exam }: { exam: EntranceExamListItem }) {
  const levelColor = LEVEL_COLORS[exam.examLevel] ?? LEVEL_COLORS.national;
  const courses = Array.isArray(exam.applicableCourses)
    ? exam.applicableCourses
    : [];

  return (
    <Link
      href={`/entrance-exams/${exam.id}`}
      className="group flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              style={{ background: levelColor.bg, color: levelColor.text }}
            >
              {exam.examLevel}
            </span>
            <span className="text-[11px] font-semibold font-mono text-gray-400">
              {exam.code}
            </span>
          </div>
          <h2 className="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-[#E8521A] transition-colors">
            {exam.name}
          </h2>
          {exam.conductingBody && (
            <p className="text-[12px] text-gray-500 mt-0.5">
              {exam.conductingBody}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#FEF0EB] flex items-center justify-center shrink-0">
          <GraduationCap size={20} color="#E8521A" strokeWidth={1.8} />
        </div>
      </div>

      {courses.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {courses.slice(0, 4).map((c) => (
            <span
              key={c}
              className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
            >
              {c}
            </span>
          ))}
          {courses.length > 4 && (
            <span className="text-[11px] text-gray-400 px-2 py-0.5">
              +{courses.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-[12px]">
        {exam.examDate && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar size={12} className="shrink-0" />
            <span>
              Exam:{" "}
              <span className="font-semibold text-gray-800">
                {formatDate(exam.examDate)}
              </span>
            </span>
          </div>
        )}
        {exam.registrationEnd && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar size={12} className="shrink-0" />
            <span>
              Reg. ends:{" "}
              <span className="font-semibold text-gray-800">
                {formatDate(exam.registrationEnd)}
              </span>
            </span>
          </div>
        )}
        {exam.officialWebsite && (
          <div className="flex items-center gap-1.5 text-gray-500 col-span-2">
            <Globe size={12} className="shrink-0" />
            <span className="text-[#E8521A] truncate">
              {exam.officialWebsite.replace(/^https?:\/\//, "")}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end text-[12px] text-[#E8521A] font-semibold gap-0.5">
        View Details
        <ChevronRight size={14} />
      </div>
    </Link>
  );
}
