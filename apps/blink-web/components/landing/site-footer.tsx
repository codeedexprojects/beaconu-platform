import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>
            &copy; {new Date().getFullYear()} BeaconU. Blink counsellor network.
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          Support students. Grow your practice.
        </p>
      </div>
    </footer>
  );
}
