import Image from "next/image";
import { ExternalLink, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicClubDetail } from "@beaconu/types";

interface ClubDetailSectionProps {
  club: PublicClubDetail;
}

export function ClubDetailSection({ club }: ClubDetailSectionProps) {
  const activities = club.key_activities?.items ?? [];
  const events = club.recent_events?.items ?? [];

  return (
    <div>
      <div className="relative h-48 w-full bg-muted sm:h-64">
        {club.cover_image ? (
          <Image
            src={club.cover_image}
            alt={club.name ?? "Club"}
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3">
          {club.logo ? (
            <Image
              src={club.logo}
              alt={`${club.name} logo`}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl object-contain"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{club.name}</h1>
            {club.category ? (
              <Badge variant="secondary" className="mt-1">
                {club.category}
              </Badge>
            ) : null}
          </div>
        </div>

        {club.about?.description ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {club.about.description}
            </p>
          </div>
        ) : null}

        {club.mission?.description ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Mission
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {club.mission.description}
            </p>
          </div>
        ) : null}

        {activities.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Key Activities
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {activities.map((activity, i) => (
                <span
                  key={i}
                  className="rounded-full border border-border/60 px-3.5 py-1.5 text-sm"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {events.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">
                Recent Events
              </h2>
              {club.recent_events?.view_all_cta?.link ? (
                <a
                  href={club.recent_events.view_all_cta.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  {club.recent_events.view_all_cta.label}{" "}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <a
                  key={event.id}
                  href={event.link}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-2xl border border-border/60"
                >
                  {event.thumbnail ? (
                    <div className="relative h-32 w-full bg-muted">
                      <Image
                        src={event.thumbnail}
                        alt={event.title ?? "Event"}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="p-3 text-sm font-medium">{event.title}</p>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
