"use client";

import Link from "next/link";
import {
  X,
  Mail,
  Phone,
  Hash,
  Star,
  Languages,
  Wallet,
  IndianRupee,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCounsellorDetail } from "@/hooks/use-counsellors";
import { getErrorMessage } from "@/lib/api";
import type { CounsellorWithdrawalRequest } from "@beaconu/types";

function PayoutDetailRows({
  payout,
}: {
  payout: CounsellorWithdrawalRequest["payout_details"];
}) {
  if (!payout || !payout.method) {
    return (
      <p className="text-sm text-muted-foreground">
        No payout details were on file when this request was submitted.
      </p>
    );
  }
  if (payout.method === "upi") {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">UPI ID</span>
        <span className="font-mono font-medium">{payout.upi_id}</span>
      </div>
    );
  }
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Account Holder</span>
        <span className="font-medium">{payout.account_holder_name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Bank</span>
        <span className="font-medium">{payout.bank_name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Account Number</span>
        <span className="font-mono font-medium">{payout.account_number}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">IFSC</span>
        <span className="font-mono font-medium">{payout.ifsc}</span>
      </div>
    </div>
  );
}

export function WithdrawalRequestDetailDialog({
  request,
  onClose,
}: {
  request: CounsellorWithdrawalRequest | null;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useCounsellorDetail(
    request?.counsellor.id ?? "",
  );

  if (!request) return null;

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
            <h3 className="font-semibold text-base">Withdrawal Request</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {request.id}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Counsellor profile */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Counsellor Profile
          </h4>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : error || !data ? (
            <p className="text-sm text-destructive">
              {error ? getErrorMessage(error) : "Counsellor not found"}
            </p>
          ) : (
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0">
                {data.counsellor.full_name.charAt(0)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {data.counsellor.full_name}
                  </span>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {data.counsellor.counsellor_type}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {data.counsellor.email}
                  </span>
                  {data.counsellor.phone_number && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {data.counsellor.phone_number}
                    </span>
                  )}
                  {data.counsellor.counsellor_code && (
                    <span className="flex items-center gap-1 font-mono">
                      <Hash className="h-3 w-3" />
                      {data.counsellor.counsellor_code}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {data.counsellor.rating.toFixed(1)}
                  </span>
                  {data.counsellor.known_languages && (
                    <span className="flex items-center gap-1">
                      <Languages className="h-3 w-3" />
                      {data.counsellor.known_languages}
                    </span>
                  )}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="h-auto p-0 text-xs"
                >
                  <Link href={`/counsellors/${data.counsellor.id}`}>
                    View full profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Wallet */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Wallet
          </h4>
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Wallet className="h-3 w-3" /> Balance
                </div>
                <div className="text-sm font-semibold">
                  ₹{data?.wallet?.balance ?? 0}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <IndianRupee className="h-3 w-3" /> Earned
                </div>
                <div className="text-sm font-semibold">
                  ₹{data?.wallet?.total_earned ?? 0}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <IndianRupee className="h-3 w-3" /> Withdrawn
                </div>
                <div className="text-sm font-semibold">
                  ₹{data?.wallet?.total_withdrawn ?? 0}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* This request */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            This Request
          </h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount Requested</span>
            <span className="font-semibold">₹{request.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className="capitalize">
              {request.withdrawal_status ?? "—"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Requested On</span>
            <span>{new Date(request.created_at).toLocaleString()}</span>
          </div>
          {request.review_remarks && (
            <div className="text-sm">
              <span className="text-muted-foreground">Review Remarks: </span>
              {request.review_remarks}
            </div>
          )}
        </div>

        <Separator />

        {/* Payout details snapshot */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Payout Details (at time of request)
          </h4>
          <PayoutDetailRows payout={request.payout_details} />
        </div>
      </Card>
    </div>
  );
}
