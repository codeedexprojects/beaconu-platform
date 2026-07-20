import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCollegeOverviewSocial } from "@beaconu/types";

interface CtaFooterProps {
  collegeName: string;
  applyHref: string;
  campusVisitHref: string;
  social: PublicCollegeOverviewSocial[];
}

export function CtaFooter({
  collegeName,
  applyHref,
  campusVisitHref,
  social,
}: CtaFooterProps) {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Begin Your Admission Journey
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Take the first step toward studying at {collegeName}.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href={applyHref}>
              Start Application <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={campusVisitHref}>Book Campus Visit</Link>
          </Button>
        </div>

        {social.length > 0 ? (
          <div className="mt-10 flex justify-center gap-4 text-sm text-muted-foreground">
            {social.map((link, i) => (
              <a
                key={`${link.platform}-${i}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="capitalize hover:text-foreground"
              >
                {link.platform}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
