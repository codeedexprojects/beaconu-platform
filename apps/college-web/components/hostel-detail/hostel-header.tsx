import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";
import type { PublicHostelHeader } from "@beaconu/types";

interface HostelHeaderProps {
  header: PublicHostelHeader;
  subdomain: string;
}

export function HostelHeader({ header, subdomain }: HostelHeaderProps) {
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
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative mx-auto flex min-h-[320px] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6">
        <Link
          href={`/college/${subdomain}/hostels`}
          className="mb-4 flex w-fit items-center gap-1.5 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to hostels
        </Link>

        <div className="flex flex-wrap gap-2">
          {header.tags?.map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white"
            >
              {tag.label}
            </span>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {header.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {header.rating_badge ? (
            <span className="flex items-center gap-1 text-sm font-medium text-white">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {header.rating_badge.rating} ({header.rating_badge.review_count}{" "}
              reviews)
            </span>
          ) : null}
          {header.verified_badge ? (
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              <ShieldCheck className="h-4 w-4" />
              {header.verified_badge.text}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
