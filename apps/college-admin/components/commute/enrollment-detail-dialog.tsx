"use client";

import { Loader2, Mail, Phone, MapPin, Bus, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCollegeCommuteEnrollment } from "@/hooks/use-facilities";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  paid: "default",
  pending: "secondary",
  completed: "default",
  failed: "destructive",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EnrollmentDetailDialog({
  enrollmentId,
  onClose,
}: {
  enrollmentId: string | null;
  onClose: () => void;
}) {
  const { data: enrollment, isLoading } =
    useCollegeCommuteEnrollment(enrollmentId);

  return (
    <Dialog
      open={enrollmentId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Commute Enrollment Detail</DialogTitle>
        </DialogHeader>

        {isLoading || !enrollment ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-2">
              <h4 className="flex items-center gap-2 text-sm font-bold">
                <User className="h-4 w-4" /> Student
              </h4>
              <div className="rounded-lg border p-3 space-y-1">
                <div className="font-medium">{enrollment.student.fullName}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" /> {enrollment.student.email ?? "—"}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />{" "}
                  {enrollment.student.phoneCountryCode ?? ""}{" "}
                  {enrollment.student.phoneNumber ?? "—"}
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="flex items-center gap-2 text-sm font-bold">
                <Bus className="h-4 w-4" /> Route & Bus
              </h4>
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">{enrollment.route.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bus</span>
                  <span className="font-medium">
                    {enrollment.bus.busNumber}
                    {enrollment.bus.busName
                      ? ` — ${enrollment.bus.busName}`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver</span>
                  <span className="font-medium">
                    {enrollment.bus.driverName ?? "—"}
                    {enrollment.bus.driverPhone
                      ? ` (${enrollment.bus.driverPhone})`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver Status</span>
                  <Badge variant="outline">{enrollment.bus.driverStatus}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Fee</span>
                  <span className="font-medium">
                    ₹{enrollment.bus.monthlyFee}
                  </span>
                </div>
                <div className="flex items-center gap-1 pt-1 border-t text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />{" "}
                  {enrollment.pickupStop.stopName}
                  {enrollment.pickupStop.morningTime && (
                    <span>· Morning {enrollment.pickupStop.morningTime}</span>
                  )}
                  {enrollment.pickupStop.eveningTime && (
                    <span>· Evening {enrollment.pickupStop.eveningTime}</span>
                  )}
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={STATUS_VARIANTS[enrollment.status] ?? "outline"}
                  >
                    {enrollment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enrolled From</span>
                  <span>{formatDate(enrollment.enrolledFrom)}</span>
                </div>
                {enrollment.enrolledUntil && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Enrolled Until
                    </span>
                    <span>{formatDate(enrollment.enrolledUntil)}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-bold">Payment Details</h4>
              {enrollment.payments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No commute fee payments yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {enrollment.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-lg border p-3 space-y-2 text-sm"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium">
                          {payment.description ?? "Commute fee"}
                        </span>
                        <Badge
                          variant={STATUS_VARIANTS[payment.status] ?? "outline"}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <div>Amount</div>
                          <div className="text-foreground font-medium">
                            ₹{payment.amount}
                          </div>
                        </div>
                        <div>
                          <div>Paid</div>
                          <div className="text-foreground font-medium">
                            ₹{payment.paidAmount}
                          </div>
                        </div>
                        <div>
                          <div>Balance</div>
                          <div className="text-foreground font-medium">
                            ₹{payment.balanceAmount}
                          </div>
                        </div>
                      </div>
                      {payment.transactions.length > 0 && (
                        <div className="pt-2 border-t space-y-1">
                          {payment.transactions.map((txn) => (
                            <div
                              key={txn.id}
                              className="flex justify-between text-xs text-muted-foreground"
                            >
                              <span>
                                {txn.transactionNumber} · {txn.paymentMethod}
                              </span>
                              <span>
                                {txn.status} · {formatDateTime(txn.paidAt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
