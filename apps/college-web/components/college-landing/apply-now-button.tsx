"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";

export function ApplyNowButton({
  children,
  ...buttonProps
}: Omit<ButtonProps, "onClick" | "asChild">) {
  const params = useParams<{ subdomain: string }>();

  return (
    <Button {...buttonProps} asChild>
      <Link href={`/college/${params.subdomain}/applications`}>{children}</Link>
    </Button>
  );
}
