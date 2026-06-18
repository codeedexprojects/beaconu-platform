"use client";

import Link from "next/link";
import {
  X,
  Mail,
  Wallet,
  IndianRupee,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCounsellorDetail } from "@/hooks/use-counsellors";
import { getErrorMessage } from "@/lib/api";
import type { CounsellingRefundRequest } from "@beaconu/types";

export function RefundRequestDetailDialog({
  request,
  onClose,
}: {
  request: CounsellingRefundRequest | null;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useCounsellorDetail(
    request?.counsellor?.id ?? "",
  );

  if (!request) return null;

  const walletBalance = data?.wallet?.balance ?? 0;
  const insufficientBalance = !isLoading && walletBalance < request.amount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base">Refund Request</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {request.id}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Student */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Student
          </h4>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              {request.student?.full_name?.charAt(0) ?? "?"}
            </div>
            <div>
              <p className="text-sm font-medium">
                {request.student?.full_name}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" /> {request.student?.email}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Counsellor + wallet */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Counsellor (refund debited from their wallet)
          </h4>
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : error || !data ? (
            <p className="text-sm text-destructive">
              {error ? getErrorMessage(error) : "Counsellor not found"}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span>{data.counsellor.full_name}</span>
                <Link
                  href={`/counsellors/${data.counsellor.id}`}
                  className="flex items-center gap-1 text-xs text-primary"
                >
                  View profile <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Wallet className="h-3 w-3" /> Wallet Balance
                  </div>
                  <div className="text-sm font-semibold">₹{walletBalance}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <IndianRupee className="h-3 w-3" /> Refund Amount
                  </div>
                  <div className="text-sm font-semibold">
                    ₹{request.amount.toFixed(2)}
                  </div>
                </div>
              </div>
              {insufficientBalance && (
                <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 rounded-md px-2 py-1.5 mt-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Counsellor&apos;s wallet balance is lower than the refund
                  amount — approving will fail until their balance covers it.
                </div>
              )}
            </>
          )}
        </div>

        <Separator />

        {/* Request details */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Request Details
          </h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className="capitalize">
              {request.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">UPI ID</span>
            <span className="font-mono font-medium">{request.upi_id}</span>
          </div>
          {request.session && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Session Date</span>
              <span>
                {new Date(request.session.scheduled_date).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="text-sm">
            <span className="text-muted-foreground">Reason: </span>
            {request.reason}
          </div>
          {request.proof_url && (
            <a
              href={request.proof_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-primary"
            >
              View proof <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {request.review_remarks && (
            <div className="text-sm">
              <span className="text-muted-foreground">Review Remarks: </span>
              {request.review_remarks}
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Requested On</span>
            <span>{new Date(request.created_at).toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
