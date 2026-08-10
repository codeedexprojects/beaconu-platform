"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useMyTickets } from "@/hooks/use-tickets";
import { SignInCta } from "@/components/campus-visit/sign-in-cta";
import { QueryCard } from "./query-card";
import { FILTER_TABS } from "./status-styles";
import type { TicketStatus } from "@beaconu/types";

interface QueriesListProps {
  subdomain: string;
}

export function QueriesList({ subdomain }: QueriesListProps) {
  const student = useAuthStore((s) => s.student);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "all">("all");

  const { data, isLoading } = useMyTickets(
    {
      status: activeFilter === "all" ? undefined : activeFilter,
      search: search.trim() || undefined,
    },
    Boolean(student),
  );

  if (!hasHydrated) return null;

  if (!student) {
    return (
      <SignInCta
        subdomain={subdomain}
        message="Sign in to see your submitted queries."
      />
    );
  }

  const tickets = data?.tickets ?? [];

  return (
    <div className="relative pb-24">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by keyword or ID..."
          className="h-11 w-full rounded-full border border-border/60 bg-background pl-10 pr-4 text-sm outline-none focus:border-foreground/30"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === tab.value
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border/60 text-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {search || activeFilter !== "all"
              ? "No queries match your filters."
              : "You haven't submitted any queries yet."}
          </p>
        ) : (
          tickets.map((ticket) => (
            <QueryCard key={ticket.id} ticket={ticket} subdomain={subdomain} />
          ))
        )}
      </div>

      <Link
        href={`/college/${subdomain}/queries/new`}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Submit new query"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
