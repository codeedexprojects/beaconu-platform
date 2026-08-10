"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  formatTicketDate,
  formatRelativeTime,
} from "./status-styles";
import type { TicketListItem } from "@beaconu/types";

interface QueryCardProps {
  ticket: TicketListItem;
  subdomain: string;
}

export function QueryCard({ ticket, subdomain }: QueryCardProps) {
  return (
    <Link
      href={`/college/${subdomain}/queries/${ticket.id}`}
      className="block rounded-2xl border border-border/60 p-4 transition-colors hover:border-foreground/20"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug">{ticket.subject}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          #{ticket.ticketNumber.slice(-6).toUpperCase()}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Submitted: {formatTicketDate(ticket.createdAt)}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <Badge variant="outline" className={STATUS_BADGE_CLASS[ticket.status]}>
          {STATUS_LABEL[ticket.status]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Updated: {formatRelativeTime(ticket.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
