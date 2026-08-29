import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import type { PublicCollegeOverviewReel } from "@beaconu/types";

interface OurStoriesSectionProps {
  reels: PublicCollegeOverviewReel[];
  collegeName?: string;
}

export function OurStoriesSection({
  reels,
  collegeName,
}: OurStoriesSectionProps) {
  if (reels.length === 0) return null;

  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-background p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="shrink-0 lg:w-64">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
                <span className="h-px w-6 bg-headerTeal" />
                Campus Life
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Our Stories
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Life, learning, and legacy through the eyes of our community.
                Discover the personal journeys that define
                {collegeName
                  ? ` the ${collegeName} experience.`
                  : " our experience."}
              </p>
              <button
                type="button"
                className="mt-6 flex items-center gap-3 rounded-full bg-headerTeal-dark py-1.5 pl-5 pr-1.5 text-sm font-medium text-white hover:bg-headerTeal-dark/90"
              >
                Watch more stories
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-headerTeal-dark">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            </div>

            <div className="no-scrollbar flex flex-1 gap-4 overflow-x-auto pb-1">
              {reels.map((reel, i) => (
                <a
                  key={`${reel.title}-${i}`}
                  href={reel.video}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-[336/453] w-56 max-w-full shrink-0 overflow-hidden rounded-[17px] bg-muted"
                >
                  {reel.thumbnail ? (
                    <Image
                      src={reel.thumbnail}
                      alt={reel.title ?? "Campus reel"}
                      fill
                      sizes="224px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 backdrop-blur">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </span>
                  </div>
                  <p className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-sm font-medium text-white">
                    {reel.title ?? collegeName}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
