"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoUpload } from "@/components/ui/video-upload";

interface VideoEntry {
  title: string;
  url: string;
}

interface VideoListEditorProps {
  value: string; // JSON string: [{title, url}]
  onChange: (json: string) => void;
  disabled?: boolean;
}

function parseEntries(json: string): VideoEntry[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is VideoEntry => typeof v === "object" && v !== null)
      .map((v) => ({
        title: typeof v.title === "string" ? v.title : "",
        url: typeof v.url === "string" ? v.url : "",
      }));
  } catch {
    return [];
  }
}

export function VideoListEditor({
  value,
  onChange,
  disabled,
}: VideoListEditorProps) {
  const entries = useMemo(() => parseEntries(value), [value]);

  function update(next: VideoEntry[]) {
    onChange(JSON.stringify(next, null, 2));
  }

  function addEntry() {
    update([...entries, { title: "", url: "" }]);
  }

  function removeEntry(index: number) {
    update(entries.filter((_, i) => i !== index));
  }

  function updateEntry(index: number, field: keyof VideoEntry, val: string) {
    update(entries.map((e, i) => (i === index ? { ...e, [field]: val } : e)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Videos</Label>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Video
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3 text-center border border-dashed rounded-lg">
          No videos added yet.
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 space-y-3 bg-muted/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Video {i + 1}
                </span>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => removeEntry(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input
                  value={entry.title}
                  onChange={(e) => updateEntry(i, "title", e.target.value)}
                  placeholder="e.g. Campus Tour"
                  disabled={disabled}
                />
              </div>

              <VideoUpload
                label="Video File"
                value={entry.url}
                onChange={(url) => updateEntry(i, "url", url)}
                context="university-videos"
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
