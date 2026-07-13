"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAddToWishlist, useRemoveFromWishlist } from "@/hooks/use-wishlist";

interface WishlistButtonProps {
  collegeId: string;
  isWishlisted: boolean;
  className?: string;
}

export function WishlistButton({
  collegeId,
  isWishlisted,
  className,
}: WishlistButtonProps) {
  const { mutate: add, isPending: isAdding } = useAddToWishlist();
  const { mutate: remove, isPending: isRemoving } = useRemoveFromWishlist();
  const isPending = isAdding || isRemoving;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    if (isWishlisted) {
      remove(collegeId, {
        onSuccess: () => toast.success("Removed from wishlist"),
      });
    } else {
      add(collegeId, {
        onSuccess: () => toast.success("Added to wishlist"),
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform active:scale-90 disabled:opacity-60",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-[18px] w-[18px] transition-colors",
          isWishlisted
            ? "fill-orange-500 text-orange-500"
            : "fill-none text-gray-400",
        )}
      />
    </button>
  );
}
