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
      <div className="relative bg-[#E6F7FF] py-10">
        <Link
          href={`/college/${subdomain}`}
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted sm:left-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="flex items-center justify-center gap-2.5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <Globe2 className="h-7 w-7" />
            {section.title}
          </h1>
          {section.group ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Part of {section.group.name}.
            </p>
          ) : null}
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
