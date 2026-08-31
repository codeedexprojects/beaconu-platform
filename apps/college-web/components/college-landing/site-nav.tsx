"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, LogOut, Menu, User2, X } from "lucide-react";
import { ApplyNowButton } from "@/components/college-landing/apply-now-button";
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
  sections: NavLink[];
  moreSections?: NavLink[];
}

function AccountMenu() {
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
      <ApplyNowButton className="rounded-full bg-headerTeal-dark py-1.5 pl-4 pr-1.5 text-sm font-medium text-white hover:bg-headerTeal-dark/90">
        Admission Opened
        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-headerTeal-dark">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </ApplyNowButton>
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
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border/60 bg-background p-1.5 shadow-xl">
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
  sections,
  moreSections = [],
}: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [hideUtilityBar, setHideUtilityBar] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const SCROLL_DELTA_THRESHOLD = 10;

    function handleScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollYRef.current;

        if (currentScrollY <= 80) {
          setHideUtilityBar(false);
        } else if (Math.abs(delta) > SCROLL_DELTA_THRESHOLD) {
          setHideUtilityBar(delta > 0);
        }

        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const utilityRight = sections.find((s) => s.id === "gallery");
  const utilityLeft = utilityRight
    ? sections.filter((s) => s.id !== utilityRight.id)
    : sections;

  return (
    <header className="sticky top-0 z-50">
      {/* Tier 1 — utility bar */}
      {sections.length > 0 ? (
        <div
          className={cn(
            "hidden overflow-hidden bg-headerTeal text-headerTeal-foreground transition-[max-height] duration-300 lg:block",
            hideUtilityBar ? "max-h-0" : "max-h-8",
          )}
        >
          <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-4 text-xs sm:px-6">
            <nav className="flex items-center gap-5">
              {utilityLeft.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-white/80 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {utilityRight ? (
              <nav className="flex items-center gap-5">
                <Link
                  href={utilityRight.href}
                  className="text-white/80 transition-colors hover:text-white"
                >
                  {utilityRight.label}
                </Link>
              </nav>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Tier 2 — brand row */}
      <div className="relative z-10 border-b border-border/60 bg-background/95 backdrop-blur">
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

          <div className="hidden lg:block">
            <AccountMenu />
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
      </div>

      {/* Tier 3 — main nav */}
      <div className="relative hidden overflow-hidden bg-gradient-to-b from-headerTeal-dark to-headerTeal-light lg:block">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/0" />
        <nav className="relative mx-auto flex h-11 max-w-6xl items-center gap-6 px-4 sm:px-6">
          {moreSections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {[...sections, ...moreSections].map((section) => (
              <Link
                key={section.id}
                href={section.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {section.label}
              </Link>
            ))}
          </nav>
          <ApplyNowButton size="sm" className="mt-3 w-full">
            Apply Now
          </ApplyNowButton>
        </div>
      ) : null}
    </header>
  );
}
