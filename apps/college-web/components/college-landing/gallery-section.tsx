import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { PublicGalleryItem } from "@beaconu/types";

interface GallerySectionProps {
  gallery: PublicGalleryItem[];
  subdomain: string;
}

const PLACEHOLDER_IMAGE_COUNT = 6;

export function GallerySection({ gallery, subdomain }: GallerySectionProps) {
  const realImages = gallery.filter((item) => item.mediaType === "image");
  const images: (PublicGalleryItem | null)[] =
    realImages.length > 0
      ? realImages
      : Array.from({ length: PLACEHOLDER_IMAGE_COUNT }, () => null);

  return (
    <section id="gallery" className="bg-muted/40 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
    </section>
  );
}
