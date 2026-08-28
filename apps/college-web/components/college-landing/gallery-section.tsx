import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ImageIcon, Play } from "lucide-react";
import type {
  PublicCollegeOverviewReel,
  PublicGalleryItem,
} from "@beaconu/types";

interface GallerySectionProps {
  gallery: PublicGalleryItem[];
  reels: PublicCollegeOverviewReel[];
  collegeName?: string;
  subdomain: string;
}

const PLACEHOLDER_IMAGE_COUNT = 6;

export function GallerySection({
  gallery,
  reels,
  collegeName,
  subdomain,
}: GallerySectionProps) {
  const realImages = gallery.filter((item) => item.mediaType === "image");
  const images: (PublicGalleryItem | null)[] =
    realImages.length > 0
      ? realImages
      : Array.from({ length: PLACEHOLDER_IMAGE_COUNT }, () => null);

  return (
    <section id="gallery" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {reels.length > 0 ? (
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
                  className="mt-6 flex items-center gap-2 rounded-full bg-headerTeal-dark px-5 py-2.5 text-sm font-medium text-white hover:bg-headerTeal-dark/90"
                >
                  Watch more stories
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-1 gap-4 overflow-x-auto pb-1">
                {reels.map((reel, i) => (
                  <a
                    key={`${reel.title}-${i}`}
                    href={reel.video}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative aspect-[3/4] w-52 shrink-0 overflow-hidden rounded-2xl bg-muted"
                  >
                    {reel.thumbnail ? (
                      <Image
                        src={reel.thumbnail}
                        alt={reel.title ?? "Campus reel"}
                        fill
                        sizes="208px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/25" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 backdrop-blur">
                        <Play className="h-5 w-5 fill-white text-white" />
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
        ) : null}

        <div className={reels.length > 0 ? "mt-10" : ""}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
                <span className="h-px w-6 bg-headerTeal" />
                Framed Moments
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Campus Gallery
              </h2>
            </div>
            <Link
              href={`/college/${subdomain}#gallery`}
              className="flex items-center gap-1 text-sm font-medium text-headerTeal hover:text-headerTeal-dark"
            >
              View all photos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:grid-rows-2">
            {images.slice(0, 6).map((item, i) => (
              <div
                key={item?.id ?? `placeholder-${i}`}
                className={`relative overflow-hidden rounded-2xl bg-muted ${
                  i === 0
                    ? "aspect-[4/3] sm:aspect-auto sm:col-span-1 sm:row-span-2"
                    : "aspect-[4/3]"
                }`}
              >
                {item ? (
                  <Image
                    src={item.url}
                    alt={item.caption ?? "Campus photo"}
                    fill
                    sizes={
                      i === 0
                        ? "(min-width: 640px) 34vw, 100vw"
                        : "(min-width: 640px) 22vw, 50vw"
                    }
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
