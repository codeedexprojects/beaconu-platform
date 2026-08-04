"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface ComingSoonDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ComingSoonDialog({ open, onClose }: ComingSoonDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border/60 bg-background p-6 text-center shadow-2xl">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold leading-none">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Online applications aren&apos;t open yet. Check back soon.
          </p>
        </div>
        <Button size="sm" className="w-full" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>,
    document.body,
  );
}
