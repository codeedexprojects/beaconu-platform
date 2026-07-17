import Image from "next/image";
import { MessageCircle, User2 } from "lucide-react";
import type { PublicCollegeOverviewAmbassador } from "@beaconu/types";

interface AmbassadorsSectionProps {
  ambassadors: PublicCollegeOverviewAmbassador[];
}

export function AmbassadorsSection({ ambassadors }: AmbassadorsSectionProps) {
  const items = ambassadors.filter((a) => a.name);
  if (items.length === 0) return null;

  return (
    <section id="ambassadors" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Campus Ambassadors
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Hear from current students about life on campus.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((ambassador, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 p-5 text-center"
          >
            {ambassador.image ? (
              <Image
                src={ambassador.image}
                alt={ambassador.name ?? "Ambassador"}
                width={64}
                height={64}
                className="mx-auto h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User2 className="h-6 w-6 text-muted-foreground" />
              </span>
            )}
            <p className="mt-3 text-sm font-semibold">{ambassador.name}</p>
            {ambassador.course ? (
              <p className="text-xs text-muted-foreground">
                {ambassador.course}
              </p>
            ) : null}
            {ambassador.district || ambassador.state ? (
              <p className="text-xs text-muted-foreground">
                {[ambassador.district, ambassador.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
            {ambassador.message_link ? (
              <a
                href={ambassador.message_link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Message
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
