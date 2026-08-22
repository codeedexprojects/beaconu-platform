"use client";

import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";
import { useIcons } from "@/hooks/use-icons";

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string;
  onSelect: (iconUrl: string) => void;
  uploadContext?: string;
}

type PickerTab = "existing" | "upload";

export function IconPicker({
  open,
  onOpenChange,
  value,
  onSelect,
  uploadContext = "icons",
}: IconPickerProps) {
  const [tab, setTab] = useState<PickerTab>("existing");
  const [search, setSearch] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const { data, isLoading } = useIcons({
    is_active: true,
    search: search || undefined,
    limit: 50,
  });
  const icons = data?.data ?? [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h3 className="font-semibold text-lg">Select an Icon</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 border-b p-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab("existing")}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "existing"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            Choose Existing
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "upload"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            Upload New
          </button>
        </div>

        {tab === "existing" ? (
          <CardContent className="p-6 space-y-4 overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : icons.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No icons found
              </p>
            ) : (
              <div className="grid max-h-80 grid-cols-4 gap-3 overflow-y-auto pr-1 sm:grid-cols-5">
                {icons.map((icon) => {
                  const isSelected = icon.iconUrl === value;
                  return (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => {
                        onSelect(icon.iconUrl);
                        onOpenChange(false);
                      }}
                      className={`group relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors hover:border-primary hover:bg-muted/50 ${
                        isSelected ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      {isSelected && (
                        <Check className="absolute right-1 top-1 h-3.5 w-3.5 text-primary" />
                      )}
                      <img
                        src={icon.iconUrl}
                        alt={icon.name}
                        className="h-8 w-8 object-contain"
                      />
                      <span className="line-clamp-1 text-[11px] text-muted-foreground">
                        {icon.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        ) : (
          <CardContent className="p-6 space-y-4">
            <ImageUpload
              value={uploadedUrl}
              onChange={setUploadedUrl}
              context={uploadContext}
              label="Upload an icon image"
            />
            <Button
              type="button"
              className="w-full"
              disabled={!uploadedUrl}
              onClick={() => {
                onSelect(uploadedUrl);
                setUploadedUrl("");
                onOpenChange(false);
              }}
            >
              Use This Icon
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

interface IconPickerFieldProps {
  value?: string;
  onChange: (iconUrl: string) => void;
  uploadContext?: string;
}

/** Drop-in replacement for a file-upload input: shows the currently
 * selected icon (if any) and a button that opens the IconPicker modal
 * (choose from existing icons, or upload a new one). */
export function IconPickerField({
  value,
  onChange,
  uploadContext,
}: IconPickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted overflow-hidden">
        {value ? (
          <img
            src={value}
            alt="Selected icon"
            className="h-6 w-6 object-contain"
          />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {value ? "Change Icon" : "Select Icon"}
      </Button>
      <IconPicker
        open={open}
        onOpenChange={setOpen}
        value={value}
        onSelect={onChange}
        uploadContext={uploadContext}
      />
    </div>
  );
}
