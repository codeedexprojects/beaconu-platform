"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ComingSoonDialog } from "@/components/ui/coming-soon-dialog";

export function ApplyNowButton({
  children,
  ...buttonProps
}: Omit<ButtonProps, "onClick" | "asChild">) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <ComingSoonDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
