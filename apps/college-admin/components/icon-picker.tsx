"use client";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIcons } from "@/hooks/use-icons";

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string;
  onSelect: (iconUrl: string) => void;
}

export function IconPicker({
  open,
  onOpenChange,
  value,
  onSelect,
}: IconPickerProps) {
  const [search, setSearch] = useState("");
  const { data: icons, isLoading } = useIcons(search || undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
          ) : !icons || icons.length === 0 ? (
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface IconPickerFieldProps {
  value?: string;
  onChange: (iconUrl: string) => void;
  label?: string;
}

/** Drop-in replacement for a file-upload input: shows the currently
 * selected icon (if any) and a button that opens the IconPicker dialog. */
export function IconPickerField({ value, onChange }: IconPickerFieldProps) {
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
      />
    </div>
  );
}
