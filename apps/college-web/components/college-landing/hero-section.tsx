import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyNowButton } from "@/components/college-landing/apply-now-button";

interface HeroSectionProps {
  collegeName: string;
  altName?: string;
  coverImageUrl: string | null;
  locationText: string;
  universityTypeName: string | null;
  establishedYear: number | null;
  campusVisitHref: string;
}

export function HeroSection({
  collegeName,
  altName,
  coverImageUrl,
  locationText,
  universityTypeName,
  establishedYear,
  campusVisitHref,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={`${collegeName} campus`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative mx-auto flex min-h-[520px] max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        {altName ? (
          <p className="text-sm font-medium text-white/70">{altName}</p>
        ) : null}
        <h1 className="mt-2 max-w-3xl text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
          {collegeName}
        </h1>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/80">
          {locationText ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {locationText}
            </span>
          ) : null}
          {universityTypeName ? <span>{universityTypeName}</span> : null}
          {establishedYear ? <span>Established {establishedYear}</span> : null}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ApplyNowButton
            size="lg"
            className="rounded-full bg-white text-headerTeal-dark hover:bg-white/90"
          >
            Start Application
          </ApplyNowButton>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="rounded-full border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={campusVisitHref}>Book Campus Visit</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
