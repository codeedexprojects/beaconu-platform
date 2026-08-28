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
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={`/college/${subdomain}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back to college page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
            <ShieldCheck className="h-6 w-6" />
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
