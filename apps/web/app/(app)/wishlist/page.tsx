"use client";

import Image from "next/image";
import { Heart, Star, MapPin } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { WishlistButton } from "@/components/wishlist/WishlistButton";

export default function WishlistPage() {
  const { data, isLoading, error } = useWishlist();

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">
          My Wishlist
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Colleges you&apos;ve saved for later
        </p>

        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 bg-white rounded-2xl animate-pulse opacity-60"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">
            Couldn&apos;t load your wishlist. Please try again.
          </p>
        )}

        {data && data.colleges.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-gray-600 font-medium">
              You haven&apos;t saved any colleges yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Tap the heart icon on a college to add it here
            </p>
          </div>
        )}

        {data && data.colleges.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {data.colleges.map((college) => (
              <div
                key={college.id}
                className="relative flex gap-3 bg-white rounded-2xl border border-gray-100 p-3 shadow-sm"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {college.logoUrl && (
                    <Image
                      src={college.logoUrl}
                      alt={college.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#111827] leading-snug truncate pr-8">
                    {college.name}
                  </p>
                  {(college.city || college.state) && (
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {[college.city, college.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                    {college.avgRating.toFixed(1)} ({college.reviewCount})
                  </p>
                </div>
                <WishlistButton
                  collegeId={college.id}
                  isWishlisted
                  className="absolute right-3 top-3"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
