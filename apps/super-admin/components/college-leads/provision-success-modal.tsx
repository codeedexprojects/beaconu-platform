"use client";

import { CheckCircle2, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { UpdateStatusResponse } from "@/lib/services/college-leads.service";

interface ProvisionSuccessModalProps {
  data: UpdateStatusResponse["provisionedCollege"] | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProvisionSuccessModal({
  data,
  isOpen,
  onClose,
}: ProvisionSuccessModalProps) {
  if (!data || !isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.setupUrl);
    toast.success("Setup link copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-center text-xl font-semibold mb-2">
            College Provisioned Successfully
          </h3>
          <p className="text-center text-sm text-muted-foreground mb-6">
            The college shell and admin account have been created. The
            onboarding contact will receive an email with their setup link
            shortly.
          </p>
        </div>

        <div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg border">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">College:</div>
            <div className="col-span-2 font-medium">{data.name}</div>

            <div className="text-muted-foreground">Subdomain:</div>
            <div className="col-span-2 font-mono">{data.slug}.beaconu.com</div>

            <div className="text-muted-foreground">Admin Code:</div>
            <div className="col-span-2">{data.code}</div>

            <div className="text-muted-foreground">Admin Email:</div>
            <div className="col-span-2">{data.adminEmail}</div>

            {data.groupCode && (
              <>
                <div className="text-primary font-semibold mt-2 pt-2 border-t">
                  Institution Group:
                </div>
                <div className="col-span-2 mt-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {data.groupCode}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(data.groupCode!);
                        toast.success("Group code copied to clipboard");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium">Manual Setup Link</p>
          <p className="text-xs text-muted-foreground mb-2">
            {
              "If the contact doesn't receive the email, you can share this one-time setup link with them directly."
            }
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 truncate bg-muted px-3 py-2 rounded-md text-xs font-mono select-all border">
              {data.setupUrl}
            </div>
            <Button
              type="button"
              size="sm"
              className="px-3 shrink-0"
              onClick={handleCopyLink}
            >
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}
