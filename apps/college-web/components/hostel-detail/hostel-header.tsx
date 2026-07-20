import Image from "next/image";
import { ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicHostelHeader } from "@beaconu/types";

interface HostelHeaderProps {
  header: PublicHostelHeader;
}

export function HostelHeader({ header }: HostelHeaderProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {header.cover_image ? (
          <Image
            src={header.cover_image}
            alt={header.name ?? "Hostel"}
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

      <div className="relative mx-auto flex min-h-[320px] max-w-6xl flex-col justify-end px-4 pb-10 pt-32 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {header.tags?.map((tag, i) => (
            <Badge key={i} variant="secondary">
              {tag.label}
            </Badge>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {header.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {header.rating_badge ? (
            <span className="flex items-center gap-1 text-sm font-medium">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {header.rating_badge.rating} ({header.rating_badge.review_count}{" "}
              reviews)
            </span>
          ) : null}
          {header.verified_badge ? (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              {header.verified_badge.text}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
