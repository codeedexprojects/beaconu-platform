"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  BadgeCheck,
  Globe,
  CalendarDays,
  Hash,
  Building2,
  Users,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUniversity } from "@/hooks/use-universities";
import type { University } from "@beaconu/types";

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "overview" | "governance" | "media";

// ── Constants ──────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "governance", label: "Governance" },
  { id: "media", label: "Media" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-50 text-gray-500 border-gray-200",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  archived: {
    label: "Archived",
    className: "bg-red-50 text-red-600 border-red-200",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Metadata accessors ─────────────────────────────────────────────────────

function getOverview(university: University) {
  const meta = university.metadata;
  const overview = isRecord(meta?.overview) ? meta.overview : {};
  const details = isRecord(overview.university_details)
    ? overview.university_details
    : {};
  const accolades = isRecord(overview.accolades) ? overview.accolades : {};
  const streams = asArr(overview.discipline).filter(isRecord);
  const videos = asArr(overview.videos).filter(isRecord);

  return {
    description: asStr(overview.description),
    details: {
      estDate: asStr(details.est_date),
      nature: asStr(details.nature_of_university),
      type: asStr(details.type_of_university),
      district: asStr(details.district),
      state: asStr(details.state),
      pincode: asStr(details.pincode),
    },
    accolades: {
      image: asStr(accolades.image),
      description: asStr(accolades.description),
      subdescription: asStr(accolades.subdescription),
    },
    streams,
    videos,
  };
}

function getGovernance(university: University) {
  const meta = university.metadata;
  const gov = isRecord(meta?.governance) ? meta.governance : {};

  function parseCouncil(raw: unknown) {
    if (!isRecord(raw)) return { description: "", members: [] };
    const members = asArr(raw.members)
      .filter(isRecord)
      .map((m) => ({
        userPhotoUrl: asStr(m.userPhotoUrl),
        name: asStr(m.name),
        designation: asStr(m.designation),
        description: asStr(m.description),
      }));
    return { description: asStr(raw.description), members };
  }

  const organogramRaw = isRecord(gov.organizational_organogram)
    ? gov.organizational_organogram
    : isRecord(gov.organizationalOrgaonagram)
      ? gov.organizationalOrgaonagram
      : {};

  return {
    academic: parseCouncil(gov.academic_council),
    management: parseCouncil(gov.management_council),
    organogram: {
      title: asStr(organogramRaw.title),
      fileUrl:
        asStr((organogramRaw as Record<string, unknown>).fileUrl) ||
        asStr((organogramRaw as Record<string, unknown>).imageUrl),
      description: asStr(organogramRaw.description),
    },
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-500 border-gray-200",
    icon: null,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
        cfg.className,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function TabNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="flex gap-1 border-b mb-6">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === t.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function MemberCard({
  member,
}: {
  member: {
    userPhotoUrl: string;
    name: string;
    designation: string;
    description: string;
  };
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0 overflow-hidden">
        {member.userPhotoUrl ? (
          <img
            src={member.userPhotoUrl}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        ) : (
          (member.name.charAt(0) || "?").toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm">{member.name || "—"}</p>
        {member.designation && (
          <p className="text-xs text-muted-foreground">{member.designation}</p>
        )}
        {member.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {member.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: university, isLoading, error } = useUniversity(id);

  // ── Loading ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <Header title="University Detail" />
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-4 w-28" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────

  if (error || !university) {
    return (
      <>
        <Header title="University Detail" />
        <div className="p-6 flex flex-col items-center justify-center gap-3 text-center h-64">
          <GraduationCap className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">University not found.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/universities">Back to Universities</Link>
          </Button>
        </div>
      </>
    );
  }

  const overview = getOverview(university);
  const governance = getGovernance(university);

  return (
    <>
      <Header title="University Detail" />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Universities
        </Link>

        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 overflow-hidden border">
            {university.logoUrl ? (
              <img
                src={university.logoUrl}
                alt={university.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <GraduationCap className="h-8 w-8 text-violet-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{university.name}</h1>
              <StatusBadge status={university.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {university.universityType.name}
              </Badge>
              {(university.city || university.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[university.city, university.state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <TabNav active={activeTab} onChange={setActiveTab} />

        {/* ── Overview ──────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <SectionCard title="Basic Info">
                <InfoRow
                  icon={<Hash className="h-4 w-4" />}
                  label="Slug"
                  value={
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {university.slug}
                    </code>
                  }
                />
                <InfoRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="University Type"
                  value={university.universityType.name}
                />
                {university.accreditation && (
                  <InfoRow
                    icon={<BadgeCheck className="h-4 w-4" />}
                    label="Accreditation"
                    value={university.accreditation}
                  />
                )}
                {university.city && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="City"
                    value={university.city}
                  />
                )}
                {university.state && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="State"
                    value={university.state}
                  />
                )}
                <InfoRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Created"
                  value={formatDate(university.createdAt)}
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Last Updated"
                  value={formatDate(university.updatedAt)}
                />
              </SectionCard>

              {/* University Details from metadata */}
              <SectionCard title="University Details">
                {overview.details.estDate && (
                  <InfoRow
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Established"
                    value={overview.details.estDate}
                  />
                )}
                {overview.details.nature && (
                  <InfoRow
                    icon={<GraduationCap className="h-4 w-4" />}
                    label="Nature"
                    value={overview.details.nature}
                  />
                )}
                {overview.details.type && (
                  <InfoRow
                    icon={<Building2 className="h-4 w-4" />}
                    label="Type"
                    value={overview.details.type}
                  />
                )}
                {overview.details.district && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="District"
                    value={overview.details.district}
                  />
                )}
                {overview.details.state && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="State"
                    value={overview.details.state}
                  />
                )}
                {overview.details.pincode && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Pincode"
                    value={overview.details.pincode}
                  />
                )}
                {!overview.details.estDate &&
                  !overview.details.nature &&
                  !overview.details.type &&
                  !overview.details.district &&
                  !overview.details.state &&
                  !overview.details.pincode && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No details configured.
                    </p>
                  )}
              </SectionCard>
            </div>

            {/* Description */}
            {overview.description && (
              <SectionCard title="Overview Description">
                <p className="text-sm leading-relaxed text-foreground">
                  {overview.description}
                </p>
              </SectionCard>
            )}

            {/* Discipline Streams */}
            {overview.streams.length > 0 && (
              <SectionCard title="Discipline Streams">
                <div className="flex flex-wrap gap-2 pt-1">
                  {overview.streams.map((s, i) => (
                    <Badge key={i} variant="secondary">
                      {asStr(s.name) || asStr(s.slug)}
                    </Badge>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Accolades */}
            {(overview.accolades.description ||
              overview.accolades.subdescription ||
              overview.accolades.image) && (
              <SectionCard title="Accolades">
                <div className="flex items-start gap-4">
                  {overview.accolades.image && (
                    <img
                      src={overview.accolades.image}
                      alt="Accolades"
                      className="h-16 w-16 object-contain rounded border shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="space-y-1">
                    {overview.accolades.description && (
                      <p className="text-sm font-medium">
                        {overview.accolades.description}
                      </p>
                    )}
                    {overview.accolades.subdescription && (
                      <p className="text-xs text-muted-foreground">
                        {overview.accolades.subdescription}
                      </p>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* ── Governance ────────────────────────────────────────────── */}
        {activeTab === "governance" && (
          <div className="space-y-6">
            {/* Governance details text */}
            {university.governanceDetails && (
              <SectionCard title="Governance Details">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {university.governanceDetails}
                </p>
              </SectionCard>
            )}

            {/* Academic Council */}
            <SectionCard title="Academic Council">
              {governance.academic.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {governance.academic.description}
                </p>
              )}
              {governance.academic.members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No members configured.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {governance.academic.members.map((m, i) => (
                    <MemberCard key={i} member={m} />
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Management Council */}
            <SectionCard title="Management Council">
              {governance.management.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {governance.management.description}
                </p>
              )}
              {governance.management.members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No members configured.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {governance.management.members.map((m, i) => (
                    <MemberCard key={i} member={m} />
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Organogram */}
            {(governance.organogram.title ||
              governance.organogram.fileUrl ||
              governance.organogram.description) && (
              <SectionCard title="Organizational Organogram">
                {governance.organogram.title && (
                  <InfoRow
                    icon={<FileText className="h-4 w-4" />}
                    label="Title"
                    value={governance.organogram.title}
                  />
                )}
                {governance.organogram.description && (
                  <InfoRow
                    icon={<FileText className="h-4 w-4" />}
                    label="Description"
                    value={governance.organogram.description}
                  />
                )}
                {governance.organogram.fileUrl && (
                  <div className="pt-3">
                    <a
                      href={governance.organogram.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Document
                    </a>
                  </div>
                )}
              </SectionCard>
            )}

            {!university.governanceDetails &&
              governance.academic.members.length === 0 &&
              governance.management.members.length === 0 &&
              !governance.organogram.title && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No governance data configured.</p>
                </div>
              )}
          </div>
        )}

        {/* ── Media ─────────────────────────────────────────────────── */}
        {activeTab === "media" && (
          <div className="space-y-6">
            {/* Logo */}
            {university.logoUrl && (
              <SectionCard title="Logo">
                <div className="flex items-start gap-4">
                  <img
                    src={university.logoUrl}
                    alt={university.name}
                    className="h-24 w-24 object-contain rounded-xl border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="space-y-1 pt-1">
                    <p className="text-xs text-muted-foreground">Logo URL</p>
                    <a
                      href={university.logoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                    >
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      {university.logoUrl}
                    </a>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Videos */}
            {overview.videos.length > 0 && (
              <SectionCard title="Videos">
                <div className="space-y-3">
                  {overview.videos.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <p className="text-sm font-medium">
                        {asStr(v.title) || `Video ${i + 1}`}
                      </p>
                      {asStr(v.url) && (
                        <a
                          href={asStr(v.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Watch
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {!university.logoUrl && overview.videos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No media assets configured.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
