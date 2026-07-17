import { ShieldCheck } from "lucide-react";
import type { PublicCodeOfConductSection } from "@beaconu/types";

interface CodeOfConductSectionProps {
  section: PublicCodeOfConductSection;
}

export function CodeOfConductSection({ section }: CodeOfConductSectionProps) {
  const rules = (section.rules ?? []).filter((rule) => rule.rule);

  if (rules.length === 0) return null;

  return (
    <section
      id="code-of-conduct"
      className="mx-auto max-w-4xl px-4 py-16 sm:px-6"
    >
      <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
        <ShieldCheck className="h-6 w-6" />
        {section.section_title || "Student Code of Conduct"}
      </h2>

      <ol className="mt-8 space-y-4">
        {rules.map((rule, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
              {rule.number ?? i + 1}
            </span>
            <p className="pt-0.5 text-sm leading-6 text-muted-foreground">
              {rule.rule}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
