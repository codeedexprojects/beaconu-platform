import { Badge } from "@/components/ui/badge";
import type { PublicAdmissionPolicyTab } from "@beaconu/types";

interface AdmissionPolicySectionProps {
  policy: PublicAdmissionPolicyTab;
}

export function AdmissionPolicySection({
  policy,
}: AdmissionPolicySectionProps) {
  const seatMatrix = policy.seat_matrix;
  const examLevels = policy.entrance_exams_accepted?.levels ?? [];

  if (!seatMatrix?.rows?.length && examLevels.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Admission policy details aren&apos;t available yet.
      </div>
    );
  }

  return (
    <>
      {seatMatrix?.rows?.length ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-bold tracking-tight">
            {seatMatrix.title || "Seat Matrix"}
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  {(
                    seatMatrix.columns ?? ["Quota Category", "Total", "Open"]
                  ).map((col, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left font-medium text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seatMatrix.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={i > 0 ? "border-t border-border/60" : undefined}
                  >
                    <td className="px-4 py-3 font-medium">
                      {row.quota_category}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.total}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.open}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {examLevels.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-bold tracking-tight">
            {policy.entrance_exams_accepted?.title || "Entrance Exams Accepted"}
          </h2>
          <div className="mt-5 space-y-6">
            {examLevels.map((level, i) => (
              <div key={`${level.level_label}-${i}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {level.level_label}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {level.exams?.map((exam, j) => (
                    <div
                      key={`${exam.name}-${j}`}
                      className="rounded-2xl border border-border/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {exam.code_badge ? (
                          <Badge variant="secondary">{exam.code_badge}</Badge>
                        ) : null}
                        <span className="text-xs text-muted-foreground">
                          {exam.exam_code}
                        </span>
                      </div>
                      <p className="mt-2.5 text-sm font-medium">{exam.name}</p>
                      {exam.min_criteria_label ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {exam.min_criteria_label}:{" "}
                          <span className="font-medium text-foreground">
                            {exam.min_criteria_value}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
