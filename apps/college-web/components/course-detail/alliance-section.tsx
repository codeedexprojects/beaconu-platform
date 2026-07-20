"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ExternalLink, FileText, Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicAlliancePartner } from "@beaconu/types";

interface AllianceSectionProps {
  partners: PublicAlliancePartner[];
}

export function AllianceSection({ partners }: AllianceSectionProps) {
  const [openId, setOpenId] = useState<string | null>(partners[0]?.id ?? null);

  if (partners.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Alliance details aren&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <Handshake className="h-5 w-5" />
        Alliance
      </h2>

      <div className="mt-5 space-y-4">
        {partners.map((partner) => {
          const isOpen = openId === partner.id;
          const focusAreas = partner.key_focus_areas?.items ?? [];
          const docs = partner.legal_and_documentation?.items ?? [];
          const activities = partner.alliance_activities?.items ?? [];

          return (
            <div
              key={partner.id}
              className="overflow-hidden rounded-2xl border border-border/60"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : partner.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {partner.logo?.startsWith("http") ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name ?? "Partner"}
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-lg object-contain"
                    />
                  ) : null}
                  <div>
                    <p className="text-sm font-semibold">{partner.name}</p>
                    {partner.category ? (
                      <Badge variant="secondary" className="mt-1">
                        {partner.category}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen ? (
                <div className="space-y-5 border-t border-border/60 px-5 py-5">
                  {partner.about?.description ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        About
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {partner.about.description}
                      </p>
                    </div>
                  ) : null}

                  {partner.collaboration_impact?.description ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Collaboration Impact
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {partner.collaboration_impact.description}
                      </p>
                    </div>
                  ) : null}

                  {focusAreas.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Key Focus Areas
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {focusAreas.map((area, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-border/60 px-3 py-1 text-sm"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {docs.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Legal & Documentation
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {docs.map((doc, i) => (
                          <a
                            key={i}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-sm font-medium hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {doc.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {activities.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Activities
                        </p>
                        {partner.alliance_activities?.view_all_cta?.link ? (
                          <a
                            href={partner.alliance_activities.view_all_cta.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                          >
                            {partner.alliance_activities.view_all_cta.label}{" "}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {activities.map((activity) => (
                          <a
                            key={activity.id}
                            href={activity.link}
                            target="_blank"
                            rel="noreferrer"
                            className="overflow-hidden rounded-xl border border-border/60"
                          >
                            {activity.thumbnail ? (
                              <div className="relative h-24 w-full bg-muted">
                                <Image
                                  src={activity.thumbnail}
                                  alt={activity.title ?? "Activity"}
                                  fill
                                  sizes="200px"
                                  className="object-cover"
                                />
                              </div>
                            ) : null}
                            <p className="p-2.5 text-xs font-medium">
                              {activity.title}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
