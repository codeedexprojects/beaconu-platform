import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2, Globe2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { DepartmentsAccordion } from "@/components/college-landing/departments-accordion";
import type { PublicInstitutionsAcrossWorldSection } from "@beaconu/types";

interface InstitutionsSectionProps {
  section: PublicInstitutionsAcrossWorldSection;
  subdomain: string;
}

export function InstitutionsSection({
  section,
  subdomain,
}: InstitutionsSectionProps) {
  if (section.institutions.length === 0) return null;

  const selected = section.institutions.find((i) => i.selected);

  return (
    <section id="institutions" className="pb-16">
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={`/college/${subdomain}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back to college page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              <Globe2 className="h-6 w-6" />
              {section.title}
            </h1>
            {section.group ? (
              <p className="mt-1 text-sm text-white/70">
                Part of {section.group.name}.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.institutions.map((institution) => (
            <Link
              key={institution.id}
              href={`/college/${institution.slug}`}
              className={cn(
                "flex items-center gap-3 rounded-2xl p-4 transition-colors",
                institution.selected
                  ? "bg-headerTeal/10"
                  : "bg-field hover:bg-field-focus",
              )}
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background">
                {institution.logoUrl ? (
                  <Image
                    src={institution.logoUrl}
                    alt={`${institution.name} logo`}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {institution.name}
                  </p>
                  {institution.selected ? (
                    <span className="shrink-0 rounded-full bg-headerTeal-dark px-2.5 py-0.5 text-xs font-medium text-white">
                      Viewing
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {[institution.city, institution.state]
                    .filter(Boolean)
                    .join(", ") || "Location TBA"}
                </p>
                {institution.role ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {institution.role}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>

        {selected && selected.departments.length > 0 ? (
          <div className="mt-10">
            <h3 className="text-lg font-semibold">Departments & Programs</h3>
            <DepartmentsAccordion departments={selected.departments} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
