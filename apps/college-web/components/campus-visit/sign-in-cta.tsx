"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInCtaProps {
  subdomain: string;
  message?: string;
}

export function SignInCta({ subdomain, message }: SignInCtaProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <LogIn className="h-5 w-5 text-muted-foreground" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {message || "Sign in with your phone number to continue."}
      </p>
      <Button className="mt-5" asChild>
        <Link
          href={`/college/${subdomain}/login?redirect=${encodeURIComponent(pathname)}`}
        >
          Sign In
        </Link>
      </Button>
    </div>
  );
}
