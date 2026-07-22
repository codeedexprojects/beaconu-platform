import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  PublicEvaluationPattern,
  PublicExamAssessmentSection,
  PublicExamChart,
  PublicExamPolicyTab,
  PublicExamTableSection,
  PublicGradingScale,
  PublicGuidelinesBanner,
  PublicSimpleMarksTable,
} from "@beaconu/types";

function ChartBar({ chart }: { chart?: PublicExamChart }) {
  const segments = chart?.segments ?? [];
  if (segments.length === 0) return null;

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              width: `${seg.percent ?? 0}%`,
              backgroundColor: seg.color || "#ccc",
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {segments.map((seg, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: seg.color || "#ccc" }}
            />
            {seg.label} · {seg.percent}%
          </span>
        ))}
      </div>
    </div>
  );
}

function AssessmentSection({
  section,
}: {
  section: PublicExamAssessmentSection;
}) {
  const components = section.components ?? [];
  if (components.length === 0) return null;

  return (
    <div>
      {section.section ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {section.section}
        </p>
      ) : null}
      <div className="mt-2 space-y-2">
        {components.map((comp, i) => (
          <div key={i} className="rounded-xl border border-border/60 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{comp.name}</span>
              {typeof comp.marks === "number" ? (
                <span className="text-muted-foreground">
                  {comp.marks} marks
                </span>
              ) : null}
            </div>
            {comp.description ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {comp.description}
              </p>
            ) : null}
            {(comp.sub_components?.length ?? 0) > 0 ? (
              <ul className="mt-2 space-y-1 border-t border-border/60 pt-2">
                {comp.sub_components?.map((sub, j) => (
                  <li
                    key={j}
                    className="flex items-center justify-between text-xs text-muted-foreground"
                  >
                    <span>{sub.name}</span>
                    <span>{sub.marks} marks</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExternalExamSection({
  section,
}: {
  section: PublicExamAssessmentSection & PublicExamTableSection;
}) {
  if (section.rows?.length) {
    const columns = section.columns ?? [];
    return (
      <div>
        {section.section ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.section}
          </p>
        ) : null}
        <div className="mt-2 overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-medium text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, i) => (
                <tr
                  key={i}
                  className={i > 0 ? "border-t border-border/60" : undefined}
                >
                  <td className="px-3 py-2 font-medium">
                    {row.section}
                    {row.subtitle ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ({row.subtitle})
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.total_questions}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.attempt}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.marks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return <AssessmentSection section={section} />;
}

function EvaluationPatternCard({
  pattern,
}: {
  pattern: PublicEvaluationPattern;
}) {
  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">{pattern.pattern_type}</p>
        {pattern.duration ? (
          <span className="text-xs text-muted-foreground">
            Duration: {pattern.duration}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <ChartBar chart={pattern.chart} />
      </div>

      {(pattern.summary_cards?.length ?? 0) > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {pattern.summary_cards?.map((card, i) => (
            <div key={i} className="rounded-xl bg-muted/60 p-3 text-center">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-0.5 text-sm font-semibold">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {(pattern.internal_assessment?.length ?? 0) > 0 ? (
        <div className="mt-5 space-y-4">
          {pattern.internal_assessment?.map((section, i) => (
            <AssessmentSection key={i} section={section} />
          ))}
        </div>
      ) : null}

      {(pattern.external_examination?.length ?? 0) > 0 ? (
        <div className="mt-5 space-y-4">
          {pattern.external_examination?.map((section, i) => (
            <ExternalExamSection key={i} section={section} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SimpleMarksTableBlock({ table }: { table: PublicSimpleMarksTable }) {
  const components = table.components ?? [];
  if (components.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 p-5">
      {table.section_title ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {table.section_title}
        </p>
      ) : null}
      <div className="mt-3 space-y-2">
        {components.map((comp, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span>{comp.name}</span>
            <span className="font-medium">{comp.marks} marks</span>
          </div>
        ))}
      </div>
      {table.total_summary ? (
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-sm font-semibold">
          <span>{table.total_summary.label}</span>
          <span>{table.total_summary.value}</span>
        </div>
      ) : null}
    </div>
  );
}

const GRADE_COLOR_STYLES: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-800",
  blue: "bg-blue-100 text-blue-800",
  orange: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
};

function GradingScaleBlock({ scale }: { scale: PublicGradingScale }) {
  const rows = scale.rows ?? [];
  if (rows.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">
        {scale.title || "Grading Scale"}
      </h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-border/60 p-4"
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                row.grade_color
                  ? GRADE_COLOR_STYLES[row.grade_color]
                  : "bg-muted",
              )}
            >
              {row.grade}
            </span>
            <div className="text-right">
              <p className="text-sm font-medium">{row.percentage_range}</p>
              <p className="text-xs text-muted-foreground">
                GP {row.grade_point}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuidelinesBannerBlock({ banner }: { banner: PublicGuidelinesBanner }) {
  const policies = banner.academic_policies ?? [];
  if (policies.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      {banner.tag ? (
        <Badge variant="outline" className="border-amber-300 text-amber-900">
          {banner.tag}
        </Badge>
      ) : null}
      <h2 className="mt-2 text-xl font-bold tracking-tight text-amber-950">
        {banner.title}
      </h2>
      {banner.description ? (
        <p className="mt-1.5 text-sm text-amber-900">{banner.description}</p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {policies.map((policy, i) => (
          <div key={i} className="rounded-xl bg-white/70 p-4">
            {policy.badge ? (
              <span className="inline-block rounded-full bg-amber-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                {policy.badge}
              </span>
            ) : null}
            <p className="mt-2 text-sm font-semibold">{policy.title}</p>
            <p className="mt-1 text-sm text-amber-900/80">
              {policy.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ExamPolicySectionProps {
  policy: PublicExamPolicyTab;
}

export function ExamPolicySection({ policy }: ExamPolicySectionProps) {
  const hasContent =
    (policy.evaluation_patterns?.length ?? 0) > 0 ||
    (policy.projects_dissertation?.internal_assessment?.length ?? 0) > 0 ||
    (policy.ojt_evaluation?.components?.length ?? 0) > 0 ||
    (policy.internship_evaluation?.components?.length ?? 0) > 0 ||
    (policy.grading_scale?.rows?.length ?? 0) > 0 ||
    (policy.important_guidelines_banner?.academic_policies?.length ?? 0) > 0;

  if (!hasContent) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Exam policy details aren&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
      {(policy.evaluation_patterns?.length ?? 0) > 0 ? (
        <section>
          <h2 className="text-xl font-bold tracking-tight">
            Evaluation Pattern
          </h2>
          <div className="mt-5 space-y-4">
            {policy.evaluation_patterns?.map((pattern, i) => (
              <EvaluationPatternCard key={i} pattern={pattern} />
            ))}
          </div>
        </section>
      ) : null}

      {policy.projects_dissertation &&
      (policy.projects_dissertation.internal_assessment?.length ?? 0) > 0 ? (
        <section>
          <h2 className="text-xl font-bold tracking-tight">
            Project & Dissertation
          </h2>
          <div className="mt-5">
            <EvaluationPatternCard pattern={policy.projects_dissertation} />
          </div>
        </section>
      ) : null}

      {(policy.ojt_evaluation?.components?.length ?? 0) > 0 ||
      (policy.internship_evaluation?.components?.length ?? 0) > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {policy.ojt_evaluation ? (
            <SimpleMarksTableBlock table={policy.ojt_evaluation} />
          ) : null}
          {policy.internship_evaluation ? (
            <SimpleMarksTableBlock table={policy.internship_evaluation} />
          ) : null}
        </section>
      ) : null}

      {policy.grading_scale ? (
        <GradingScaleBlock scale={policy.grading_scale} />
      ) : null}

      {policy.important_guidelines_banner ? (
        <GuidelinesBannerBlock banner={policy.important_guidelines_banner} />
      ) : null}
    </div>
  );
}
