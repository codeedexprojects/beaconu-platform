"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Solutions", hash: "#solutions" },
  { label: "Institutions", hash: "#institutions" },
  { label: "Blog", href: "/blogs" },
];

/** `onPartnerClick`: pass a scroll handler when rendering on the homepage
 * itself (scrolls to the onboarding form in place). Omit it on any other
 * page — the button then falls back to a real link to the homepage's
 * onboarding section, and the Solutions/Institutions anchors resolve
 * cross-page the same way. */
export function SiteNav({ onPartnerClick }: { onPartnerClick?: () => void }) {
  const isHomePage = !!onPartnerClick;
  const [mobileOpen, setMobileOpen] = useState(false);

  function handlePartnerClick() {
    setMobileOpen(false);
    onPartnerClick?.();
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-[100] border-b border-navy-dark/[0.06] bg-cream/85 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-landing shadow-[0_4px_16px_rgba(244,106,18,0.3)]">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white" />
          </div>
          <span className="font-serif text-lg font-bold text-navy-dark">
            Beacon<span className="text-landing">U</span>
          </span>
        </a>
        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-7 sm:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href ?? (isHomePage ? link.hash : `/${link.hash}`)}
                className="text-sm font-medium text-gray-label transition-colors hover:text-navy-dark"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden sm:block">
            {isHomePage ? (
              <button
                className="rounded-full bg-landing px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(244,106,18,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(244,106,18,0.4)]"
                onClick={onPartnerClick}
              >
                Partner With Us
              </button>
            ) : (
              <a
                href="/#partner"
                className="rounded-full bg-landing px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(244,106,18,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(244,106,18,0.4)]"
              >
                Partner With Us
              </a>
            )}
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-dark sm:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-navy-dark/[0.06] bg-cream px-4 py-3 sm:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href ?? (isHomePage ? link.hash : `/${link.hash}`)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-gray-label transition-colors hover:bg-navy-dark/[0.03] hover:text-navy-dark"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          {isHomePage ? (
            <button
              className="mt-1 rounded-full bg-landing px-6 py-2.5 text-center text-sm font-semibold text-white shadow-[0_4px_14px_rgba(244,106,18,0.3)]"
              onClick={handlePartnerClick}
            >
              Partner With Us
            </button>
          ) : (
            <a
              href="/#partner"
              className="mt-1 rounded-full bg-landing px-6 py-2.5 text-center text-sm font-semibold text-white shadow-[0_4px_14px_rgba(244,106,18,0.3)]"
              onClick={() => setMobileOpen(false)}
            >
              Partner With Us
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
