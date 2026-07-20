import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackToCollegeLinkProps {
  subdomain: string;
  href?: string;
  label?: string;
}

export function BackToCollegeLink({
  subdomain,
  href,
  label = "Back to college page",
}: BackToCollegeLinkProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <Link
        href={href ?? `/college/${subdomain}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    </div>
  );
}
