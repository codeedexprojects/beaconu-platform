import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import type { BlinkRole } from "@/lib/roles";

export function RegisterShell({
  role,
  children,
}: {
  role: BlinkRole;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <SiteHeader />

      <div className="container flex flex-1 flex-col py-10 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blink
        </Link>

        <div className="mx-auto mt-8 w-full max-w-xl">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <role.icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Request to join
              </p>
              <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
                Join as {role.shortLabel}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Tell us about yourself — the Blink team will review your request
                and reach out by email once it&apos;s approved.
              </p>
            </div>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
