"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Mic, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssessmentSections,
  useToggleAssessmentSection,
} from "@/hooks/use-assessments";
import {
  CORE_SECTIONS,
  CALCULATOR_SECTIONS,
  type CoreSectionMeta,
} from "@/lib/services/assessments.service";
import type { AssessmentSectionItem } from "@beaconu/types";

function SectionCards({
  sectionMetas,
  sections,
  icon: Icon,
  onToggle,
  pendingSlug,
}: {
  sectionMetas: CoreSectionMeta[];
  sections: AssessmentSectionItem[] | undefined;
  icon: typeof Mic;
  onToggle: (slug: string, name: string, isEnabled: boolean) => void;
  pendingSlug: string | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sectionMetas.map((meta) => {
        const section = sections?.find((s) => s.slug === meta.slug);
        const isEnabled = section?.isActive ?? false;
        const isPending = pendingSlug === meta.slug;
        return (
          <div
            key={meta.slug}
            className="flex flex-col justify-between rounded-xl border p-5 shadow-sm"
          >
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={isEnabled ? "default" : "outline"}>
                  {isEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <h3 className="font-semibold">{meta.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {meta.description}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant={isEnabled ? "outline" : "default"}
                disabled={isPending}
                onClick={() => onToggle(meta.slug, meta.name, isEnabled)}
              >
                {isPending ? "Saving..." : isEnabled ? "Disable" : "Enable"}
              </Button>
              {isEnabled && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/assessments/${meta.slug}`}>
                    Manage Questions
                  </Link>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AssessmentsPage() {
  const { data: sections, isLoading } = useAssessmentSections();
  const { mutate: toggle, isPending, variables } = useToggleAssessmentSection();
  const pendingSlug = isPending ? variables?.slug : undefined;

  function handleToggle(slug: string, name: string, isEnabled: boolean) {
    toggle(
      { slug, isActive: !isEnabled },
      {
        onSuccess: () =>
          toast.success(
            isEnabled
              ? `${name} assessment disabled`
              : `${name} assessment enabled`,
          ),
      },
    );
  }

  return (
    <div className="flex h-full flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assessments</h1>
          <p className="text-sm text-muted-foreground">
            Configure the assessment sections used to evaluate applicants.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/assessments/templates">Assessment Templates</Link>
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Core Assessment Sections</h2>
          <p className="text-sm text-muted-foreground">
            Included in every assessment regardless of course — questions here
            apply globally and cannot be mapped to specific courses.
          </p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <SectionCards
            sectionMetas={CORE_SECTIONS}
            sections={sections}
            icon={Mic}
            onToggle={handleToggle}
            pendingSlug={pendingSlug}
          />
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            Course-Specific Calculator-Based Sections
          </h2>
          <p className="text-sm text-muted-foreground">
            Activated based on the student&apos;s selected course — every
            question here must be mapped to at least one course.
          </p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <SectionCards
            sectionMetas={CALCULATOR_SECTIONS}
            sections={sections}
            icon={Calculator}
            onToggle={handleToggle}
            pendingSlug={pendingSlug}
          />
        )}
      </div>
    </div>
  );
}
