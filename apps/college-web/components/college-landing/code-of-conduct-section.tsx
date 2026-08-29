import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { PublicCodeOfConductSection } from "@beaconu/types";

interface CodeOfConductSectionProps {
  section: PublicCodeOfConductSection;
  subdomain: string;
}

export function CodeOfConductSection({
  section,
  subdomain,
}: CodeOfConductSectionProps) {
  const rules = (section.rules ?? []).filter((rule) => rule.rule);

  if (rules.length === 0) return null;

  return (
    <section id="code-of-conduct" className="pb-16">
      <div className="relative bg-[#E6F7FF] py-10">
        <Link
          href={`/college/${subdomain}`}
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted sm:left-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="flex items-center justify-center gap-2.5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <ShieldCheck className="h-7 w-7" />
            {section.section_title || "Student Code of Conduct"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
        <ol className="space-y-4">
          {rules.map((rule, i) => (
            <li key={i} className="flex gap-4 rounded-2xl bg-field p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-headerTeal-dark text-xs font-semibold text-white">
                {rule.number ?? i + 1}
              </span>
              <p className="pt-0.5 text-sm leading-6 text-foreground">
                {rule.rule}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
