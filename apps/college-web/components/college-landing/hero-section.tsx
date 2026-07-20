import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  collegeName: string;
  altName?: string;
  coverImageUrl: string | null;
  locationText: string;
  universityTypeName: string | null;
  establishedYear: number | null;
  applyHref: string;
  campusVisitHref: string;
}

export function HeroSection({
  collegeName,
  altName,
  coverImageUrl,
  locationText,
  universityTypeName,
  establishedYear,
  applyHref,
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      </div>

      <div className="relative mx-auto flex min-h-[420px] max-w-6xl flex-col justify-end px-4 pb-14 pt-32 sm:px-6">
        {altName ? (
          <p className="text-sm font-medium text-muted-foreground">{altName}</p>
        ) : null}
        <h1 className="mt-1 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
          {collegeName}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {locationText ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {locationText}
            </span>
          ) : null}
          {universityTypeName ? <span>{universityTypeName}</span> : null}
          {establishedYear ? <span>Established {establishedYear}</span> : null}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href={applyHref}>Start Application</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={campusVisitHref}>Book Campus Visit</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
