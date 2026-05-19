"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { logoutBlogAuthor } from "@/lib/services/auth.service";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const isAuthenticated = token !== null;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, hasHydrated, router]);

  /* ── Loading / unauthenticated splash ── */
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6]">
        <div className="flex flex-col items-center gap-3">
          {/* BeaconU logo mark */}
          <div className="w-12 h-12 rounded-2xl bg-[#E8521A] flex items-center justify-center shadow-[0_4px_16px_rgba(232,82,26,0.3)]">
            <span className="text-[18px] font-black text-white tracking-tight">
              B
            </span>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-[#E8521A]" />
          <p className="text-[13px] text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    if (token) {
      try {
        await logoutBlogAuthor(token);
      } catch {
        // best-effort
      }
    }
    clearAuth();
    window.location.assign("/login");
  }

  /* Derive author initials for avatar */
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "AU";

  const isBrowse = pathname.startsWith("/blogs");
  const isMyBlogs = pathname.startsWith("/my");

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* ── Sticky top nav ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/my/blogs"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="BeaconU home"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[#E8521A] flex items-center justify-center group-hover:bg-[#D04718] transition-colors">
              <span className="text-[13px] font-black text-white tracking-tight">
                B
              </span>
            </div>
            <span className="text-[15px] font-bold text-gray-900 hidden sm:inline">
              BeaconU
            </span>
          </Link>

          {/* Nav pills — same pill pattern as sort tabs */}
          <nav
            className="flex items-center gap-1.5"
            aria-label="Main navigation"
          >
            <Link
              href="/blogs"
              aria-current={isBrowse ? "page" : undefined}
              className={[
                "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-semibold transition-all",
                isBrowse
                  ? "bg-[#E8521A] text-white"
                  : "bg-white border-[1.5px] border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800",
              ].join(" ")}
            >
              {/* Book icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Browse
            </Link>

            <Link
              href="/my/blogs"
              aria-current={isMyBlogs ? "page" : undefined}
              className={[
                "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-semibold transition-all",
                isMyBlogs
                  ? "bg-[#E8521A] text-white"
                  : "bg-white border-[1.5px] border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800",
              ].join(" ")}
            >
              {/* Pen icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              My Blogs
            </Link>
          </nav>

          {/* Right side: avatar + logout */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Author avatar */}
            <div
              className="w-8 h-8 rounded-full bg-[#FEF0EB] border-2 border-white ring-1 ring-[#E8521A]/20 flex items-center justify-center"
              title={user?.fullName ?? "Author"}
              aria-label={`Signed in as ${user?.fullName ?? "Author"}`}
            >
              <span className="text-[11px] font-bold text-[#E8521A]">
                {initials}
              </span>
            </div>

            {/* Author name — desktop only */}
            {user?.fullName && (
              <span className="hidden md:inline text-[13px] text-gray-500 font-medium max-w-[120px] truncate">
                {user.fullName}
              </span>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="w-8 h-8 rounded-full border-[1.5px] border-gray-200 bg-white hover:border-red-200 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors flex items-center justify-center"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      {/*
        No extra wrapper padding here — each child page (MyBlogsList,
        BlogSubmitForm, BlogEditForm) manages its own max-width, padding,
        and sticky sub-header independently, matching the reference design.
      */}
      {children}
    </div>
  );
}
