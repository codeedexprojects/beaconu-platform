import Image from "next/image";
import { Play } from "lucide-react";
import type {
  PublicCollegeOverviewReel,
  PublicGalleryItem,
} from "@beaconu/types";

interface GallerySectionProps {
  gallery: PublicGalleryItem[];
  reels: PublicCollegeOverviewReel[];
}

export function GallerySection({ gallery, reels }: GallerySectionProps) {
  const images = gallery.filter((item) => item.mediaType === "image");

  if (images.length === 0 && reels.length === 0) return null;

  return (
    <section id="gallery" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Campus Gallery
        </h2>

        {images.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((item) => (
              <div
                key={item.id}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <Image
                  src={item.url}
                  alt={item.caption ?? "Campus photo"}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        {reels.length > 0 ? (
          <div className="mt-10">
            <p className="text-sm font-semibold text-muted-foreground">
              Campus Reels
            </p>
            <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
              {reels.map((reel, i) => (
                <a
                  key={`${reel.title}-${i}`}
                  href={reel.video}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-[9/16] w-36 shrink-0 overflow-hidden rounded-2xl bg-muted"
                >
                  {reel.thumbnail ? (
                    <Image
                      src={reel.thumbnail}
                      alt={reel.title ?? "Campus reel"}
                      fill
                      sizes="144px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-8 w-8 fill-white text-white" />
                  </div>
                  {reel.title ? (
                    <p className="absolute bottom-0 w-full truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6 text-xs font-medium text-white">
                      {reel.title}
                    </p>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
