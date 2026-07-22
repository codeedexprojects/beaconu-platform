"use client";

import { useState } from "react";

import { MediaKitFilters } from "@/components/media-kit/media-kit-filters";
import { MediaKitTable } from "@/components/media-kit/media-kit-table";
import { UploadMediaKitDialog } from "@/components/media-kit/upload-media-kit-dialog";
import { useMediaKits } from "@/hooks/use-media-kit";
import type { MediaKitAssetType, MediaKitScope } from "@beaconu/types";

export default function MediaKitPage() {
  const [assetType, setAssetType] = useState<MediaKitAssetType | "">("");
  const [scope, setScope] = useState<MediaKitScope | "">("");
  const [courseId, setCourseId] = useState("");

  const { data, isLoading } = useMediaKits({
    asset_type: assetType || undefined,
    scope: scope || undefined,
    course_id: courseId || undefined,
    limit: 50,
  });

  const items = data?.items ?? [];

  function clearFilters() {
    setAssetType("");
    setScope("");
    setCourseId("");
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Kit</h1>
          <p className="text-sm text-muted-foreground">
            Posters, videos, and brochures for ambassadors and associates
          </p>
        </div>
        <UploadMediaKitDialog />
      </div>

      <MediaKitFilters
        assetType={assetType}
        scope={scope}
        courseId={courseId}
        onAssetTypeChange={setAssetType}
        onScopeChange={setScope}
        onCourseIdChange={setCourseId}
        onClear={clearFilters}
      />

      <MediaKitTable items={items} isLoading={isLoading} />
    </div>
  );
}
