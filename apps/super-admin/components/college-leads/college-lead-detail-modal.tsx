"use client";

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CollegeLead } from "@/lib/services/college-leads.service";
import { getCollegeLink } from "@/lib/college-url";

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" as const },
  approved: { label: "Approved", variant: "success" as const },
  rejected: { label: "Rejected", variant: "destructive" as const },
};

interface CollegeLeadDetailModalProps {
  lead: CollegeLead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (lead: CollegeLead) => void;
}

export function CollegeLeadDetailModal({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
}: CollegeLeadDetailModalProps) {
  if (!isOpen || !lead) return null;

  const statusConfig = STATUS_CONFIG[lead.status];

  const publicPortalLink = lead.createdCollege
    ? getCollegeLink(lead.createdCollege.slug, "3001")
    : "";

  const adminPortalLink = lead.createdCollege
    ? getCollegeLink(lead.createdCollege.slug, "3002")
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">College Lead Details</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-base">{lead.collegeName}</h4>
              {lead.universityName && (
                <p className="text-sm text-muted-foreground">
                  {lead.universityName}
                </p>
              )}
              <Badge
                variant={statusConfig.variant}
                className="mt-1.5 capitalize text-[10px]"
              >
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Contact Person
              </p>
              <p className="font-medium">{lead.contactPersonName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Email
              </p>
              <p className="font-medium break-all">{lead.contactEmail}</p>
            </div>
            {lead.contactPhone && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  Phone
                </p>
                <p className="font-medium">{lead.contactPhone}</p>
              </div>
            )}
            {(lead.city || lead.state) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  Location
                </p>
                <p className="font-medium">
                  {[lead.city, lead.state].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
            {lead.groupCode && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  Requested Group
                </p>
                <p className="font-mono text-sm tracking-wide text-primary">
                  {lead.groupCode}
                </p>
              </div>
            )}
          </div>

          {lead.message && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Message
              </p>
              <p className="text-sm bg-muted/40 rounded-lg p-3 leading-relaxed">
                {lead.message}
              </p>
            </div>
          )}

          {lead.reviewRemarks && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Review Remarks
              </p>
              <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 leading-relaxed">
                {lead.reviewRemarks}
              </p>
            </div>
          )}

          {lead.status === "approved" && lead.createdCollege && (
            <div className="space-y-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />{" "}
                Provisioned College Links
              </p>

              <div className="space-y-3 pt-1">
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-0.5">
                    Public Landing Page
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-emerald-900 break-all select-all">
                      {publicPortalLink}
                    </span>
                    <a
                      href={publicPortalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline flex items-center shrink-0"
                    >
                      Visit Public &rarr;
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100/50">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-0.5">
                    Admin Setup Console
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-emerald-900 break-all select-all">
                      {adminPortalLink}
                    </span>
                    <a
                      href={adminPortalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline flex items-center shrink-0"
                    >
                      Visit Admin &rarr;
                    </a>
                  </div>
                </div>

                {lead.createdCollege?.ownedGroupCode && (
                  <div className="pt-2 border-t border-emerald-100/50">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-0.5">
                      Institution Group Code
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-emerald-900 break-all select-all font-medium bg-emerald-100/50 px-2 py-0.5 rounded">
                        {lead.createdCollege.ownedGroupCode}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>
              Submitted {new Date(lead.createdAt).toLocaleString("en-IN")}
            </span>
            {lead.reviewer && <span>Reviewed by {lead.reviewer.name}</span>}
          </div>
        </CardContent>

        <div className="flex justify-end gap-2 p-4 border-t bg-muted/20">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onUpdateStatus(lead)}
            disabled={lead.status === "approved"}
          >
            Update Status
          </Button>
        </div>
      </Card>
    </div>
  );
}
