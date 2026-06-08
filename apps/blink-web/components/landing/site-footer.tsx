import Link from "next/link";
import { Zap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-3.5 w-3.5" />
          </span>
          <span>Blink</span>
          <span className="text-sm font-normal text-muted-foreground">
            by BeaconU
          </span>
        </Link>

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BeaconU. All rights reserved.
        </p>

        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link
            href="#roles"
            className="transition-colors hover:text-foreground"
          >
            Who can join
          </Link>
          <Link href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
        </nav>
      </div>
    </footer>
  );
}
