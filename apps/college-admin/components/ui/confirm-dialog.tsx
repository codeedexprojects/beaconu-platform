"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Mount-gated: avoids an SSR/hydration mismatch on document.body access.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  // Rendered via a portal straight to <body> — rendering this inline inside
  // the dashboard's scrollable <main> left a gap at the top of the backdrop,
  // since fixed-position descendants of a scrolling/stacking ancestor can
  // still misalign with the true viewport in some browsers.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-4">
        <div className="space-y-1.5">
          <h3 className="font-semibold text-base leading-none">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  );
}
