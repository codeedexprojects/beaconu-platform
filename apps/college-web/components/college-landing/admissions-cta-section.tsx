import Image from "next/image";
import { ArrowRight, GraduationCap } from "lucide-react";
import { ApplyNowButton } from "@/components/college-landing/apply-now-button";

interface AdmissionsCtaSectionProps {
  admissionCycleLabel: string;
  imageUrl?: string | null;
  prospectusUrl?: string | null;
}

export function AdmissionsCtaSection({
  admissionCycleLabel,
  imageUrl,
  prospectusUrl,
}: AdmissionsCtaSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-0 overflow-hidden rounded-3xl bg-field lg:grid-cols-2">
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
            <span className="h-px w-6 bg-headerTeal" />
            Admissions {admissionCycleLabel}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Shape Your Future With Excellence
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Applications are now open for Undergraduate, Postgraduate, and
            Doctoral programmes. Join a community of scholars dedicated to
            innovation and leadership.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <ApplyNowButton className="rounded-full bg-headerTeal-dark text-white hover:bg-headerTeal-dark/90">
              Apply Now
            </ApplyNowButton>
            {prospectusUrl ? (
              <a
                href={prospectusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-headerTeal hover:text-headerTeal-dark"
              >
                Download Prospectus
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="relative h-64 w-full lg:h-full lg:min-h-[320px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Students at campus"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <GraduationCap className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
            Closing Soon
          </span>
        </div>
      </div>
    </section>
  );
}
