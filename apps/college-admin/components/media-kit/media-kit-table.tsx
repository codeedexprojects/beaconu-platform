"use client";

import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteMediaKit } from "@/hooks/use-media-kit";
import type { MediaKitListItem } from "@beaconu/types";

const ASSET_TYPE_LABELS: Record<MediaKitListItem["assetType"], string> = {
  poster: "Poster",
  video: "Video",
  brochure: "Brochure",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

interface MediaKitTableProps {
  items: MediaKitListItem[];
  isLoading: boolean;
}

export function MediaKitTable({ items, isLoading }: MediaKitTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<MediaKitListItem | null>(
    null,
  );
  const { mutate: remove, isPending: isDeleting } = useDeleteMediaKit();

  function confirmDelete() {
    if (!deleteTarget) return;
    remove(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`"${deleteTarget.title}" removed`);
        setDeleteTarget(null);
      },
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6">Title</TableHead>
                <TableHead className="py-4">Type</TableHead>
                <TableHead className="py-4">Scope</TableHead>
                <TableHead className="py-4">Course</TableHead>
                <TableHead className="py-4">Size</TableHead>
                <TableHead className="w-[100px] py-4 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No media kit assets found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 font-medium">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 hover:underline"
                      >
                        {item.title}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline">
                        {ASSET_TYPE_LABELS[item.assetType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={
                          item.scope === "course_specific"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {item.scope === "course_specific"
                          ? "Course Specific"
                          : "Campus Wide"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.course
                        ? `${item.course.name} (${item.course.code})`
                        : "—"}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatFileSize(item.fileSizeBytes)}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Media Kit Asset"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        variant="destructive"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
