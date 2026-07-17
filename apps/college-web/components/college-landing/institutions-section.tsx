import Link from "next/link";
import Image from "next/image";
import { Building2, Globe2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DepartmentsAccordion } from "@/components/college-landing/departments-accordion";
import type { PublicInstitutionsAcrossWorldSection } from "@beaconu/types";

interface InstitutionsSectionProps {
  section: PublicInstitutionsAcrossWorldSection;
}

export function InstitutionsSection({ section }: InstitutionsSectionProps) {
  if (section.institutions.length === 0) return null;

  const selected = section.institutions.find((i) => i.selected);

  return (
    <section id="institutions" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
        <Globe2 className="h-6 w-6" />
        {section.title}
      </h2>
      {section.group ? (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Part of {section.group.name}.
        </p>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {section.institutions.map((institution) => (
          <Link
            key={institution.id}
            href={`/college/${institution.slug}`}
            className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 transition-colors hover:border-foreground/30"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
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
                  <Badge variant="secondary" className="shrink-0">
                    Viewing
                  </Badge>
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
    </section>
  );
}
