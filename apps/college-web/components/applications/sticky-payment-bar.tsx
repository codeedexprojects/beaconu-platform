"use client";

import { ArrowRight, Loader2 } from "lucide-react";

interface StickyPaymentBarProps {
  totalApplicationFee: string;
  isPaid: boolean;
  isPaying: boolean;
  onPay: () => void;
}

export function StickyPaymentBar({
  totalApplicationFee,
  isPaid,
  isPaying,
  onPay,
}: StickyPaymentBarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Total Application Fees
          </p>
          <p className="text-lg font-bold">₹{totalApplicationFee}</p>
        </div>
        {isPaid ? (
          <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
            Paid
          </span>
        ) : (
          <button
            type="button"
            disabled={isPaying}
            onClick={onPay}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isPaying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Proceed to Payment
          </button>
        )}
      </div>
    </div>
  );
}
