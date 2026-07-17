"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, User2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

interface NavLink {
  id: string;
  label: string;
  href: string;
}

interface SiteNavProps {
  collegeName: string;
  logoUrl: string | null;
  applyHref: string;
  sections: NavLink[];
  moreSections?: NavLink[];
}

function MoreMenu({ items }: { items: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        More
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/60 bg-background p-1.5 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AccountMenu({ applyHref }: { applyHref: string }) {
  const router = useRouter();
  const params = useParams<{ subdomain: string }>();
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <Button size="sm" asChild>
        <Link href={applyHref}>Apply Now</Link>
      </Button>
    );
  }

  function handleLogout() {
    clearAuth();
    setOpen(false);
    router.push(`/college/${params.subdomain}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border/60 py-1.5 pl-1.5 pr-3 text-sm hover:border-foreground/30"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
          <User2 className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
        {student.fullName.split(" ")[0]}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/60 bg-background p-1.5 shadow-lg">
          <Link
            href={`/college/${params.subdomain}/campus-visit/my-visits`}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            My Campus Visits
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SiteNav({
  collegeName,
  logoUrl,
  applyHref,
  sections,
  moreSections = [],
}: SiteNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${collegeName} logo`}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-lg object-cover"
            />
          ) : null}
          <span className="truncate text-sm font-semibold tracking-tight">
            {collegeName}
          </span>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {section.label}
            </Link>
          ))}
          <MoreMenu items={moreSections} />
        </nav>

        <div className="hidden lg:block">
          <AccountMenu applyHref={applyHref} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {[...sections, ...moreSections].map((section) => (
              <Link
                key={section.id}
                href={section.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {section.label}
              </Link>
            ))}
          </nav>
          <Button size="sm" className="mt-3 w-full" asChild>
            <Link href={applyHref}>Apply Now</Link>
          </Button>
        </div>
      ) : null}
    </header>
  );
}
