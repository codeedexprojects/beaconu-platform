"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCollegeCoursesMinimal } from "@/hooks/use-colleges";
import type { MediaKitAssetType, MediaKitScope } from "@beaconu/types";

interface MediaKitFiltersProps {
  assetType: MediaKitAssetType | "";
  scope: MediaKitScope | "";
  courseId: string;
  onAssetTypeChange: (value: MediaKitAssetType | "") => void;
  onScopeChange: (value: MediaKitScope | "") => void;
  onCourseIdChange: (value: string) => void;
  onClear: () => void;
}

export function MediaKitFilters({
  assetType,
  scope,
  courseId,
  onAssetTypeChange,
  onScopeChange,
  onCourseIdChange,
  onClear,
}: MediaKitFiltersProps) {
  const { data: courses } = useCollegeCoursesMinimal(
    scope === "course_specific",
  );

  const hasFilters = assetType || scope || courseId;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={assetType || "all"}
        onValueChange={(v) =>
          onAssetTypeChange(v === "all" ? "" : (v as MediaKitAssetType))
        }
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="All asset types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All asset types</SelectItem>
          <SelectItem value="poster">Poster</SelectItem>
          <SelectItem value="video">Video</SelectItem>
          <SelectItem value="brochure">Brochure</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={scope || "all"}
        onValueChange={(v) => {
          const next = v === "all" ? "" : (v as MediaKitScope);
          onScopeChange(next);
          if (next !== "course_specific") onCourseIdChange("");
        }}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="All scopes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All scopes</SelectItem>
          <SelectItem value="campus_wide">Campus Wide</SelectItem>
          <SelectItem value="course_specific">Course Specific</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={courseId || "all"}
        onValueChange={(v) => onCourseIdChange(v === "all" ? "" : v)}
        disabled={scope !== "course_specific"}
      >
        <SelectTrigger className="h-9 w-56">
          <SelectValue placeholder="All courses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All courses</SelectItem>
          {courses?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name} ({c.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
