"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Mail,
  Phone,
  Hash,
  Wallet,
  CalendarCheck,
  CalendarClock,
  IndianRupee,
  Languages,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCounsellorDetail } from "@/hooks/use-counsellors";
import { getErrorMessage } from "@/lib/api";

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CounsellorDetailView({
  counsellorId,
}: {
  counsellorId: string;
}) {
  const { data, isLoading, error } = useCounsellorDetail(counsellorId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/counsellors">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back to Counsellors
          </Link>
        </Button>
        <div className="text-sm text-destructive">
          {error ? getErrorMessage(error) : "Counsellor not found"}
        </div>
      </div>
    );
  }

  const { counsellor, stats, wallet, slots, recent_sessions } = data;

  return (
    <div className="flex flex-col min-h-full">
      <Header title={counsellor.full_name} description="Counsellor profile">
        <Button variant="outline" size="sm" asChild>
          <Link href="/counsellors">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back
          </Link>
        </Button>
      </Header>

      <div className="flex-1 space-y-6 p-6">
        {/* Profile header */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl shrink-0">
              {counsellor.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold">
                  {counsellor.full_name}
                </h2>
                <Badge
                  variant={
                    counsellor.status === "active" ? "success" : "secondary"
                  }
                  className="capitalize"
                >
                  {counsellor.status.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {counsellor.counsellor_type}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {counsellor.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {counsellor.phone_number}
                </span>
                {counsellor.counsellor_code && (
                  <span className="flex items-center gap-1 font-mono">
                    <Hash className="h-3 w-3" /> {counsellor.counsellor_code}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {counsellor.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Languages className="h-3 w-3" />
                  {counsellor.known_languages ?? "—"}
                </span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <IndianRupee className="h-3 w-3" />
                  {counsellor.session_fee} / session
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> Available Slots
              </div>
              <div className="text-xl font-semibold">
                {stats.slots.available}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {stats.slots.booked} booked · {stats.slots.total} total
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarCheck className="h-3.5 w-3.5" /> Sessions
              </div>
              <div className="text-xl font-semibold">
                {stats.sessions.total}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {stats.sessions.completed} completed ·{" "}
                {stats.sessions.cancelled} cancelled · {stats.sessions.booked}{" "}
                upcoming
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IndianRupee className="h-3.5 w-3.5" /> Payment Received
              </div>
              <div className="text-xl font-semibold">
                ₹{stats.payments.total_payment_received}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {stats.payments.paid_sessions_count} paid sessions
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" /> Wallet Balance
              </div>
              <div className="text-xl font-semibold">
                ₹{wallet?.balance ?? 0}
              </div>
              <div className="text-[11px] text-muted-foreground">
                ₹{wallet?.total_earned ?? 0} earned · ₹
                {wallet?.total_withdrawn ?? 0} withdrawn
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Available Slots</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.available.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-sm text-muted-foreground py-6"
                      >
                        No available slots
                      </TableCell>
                    </TableRow>
                  )}
                  {slots.available.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="text-sm">
                        {formatDate(slot.available_date)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTime(slot.start_time)} –{" "}
                        {formatTime(slot.end_time)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₹{slot.session_fee}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Booked Slots</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.booked.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-sm text-muted-foreground py-6"
                      >
                        No booked slots
                      </TableCell>
                    </TableRow>
                  )}
                  {slots.booked.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="text-sm">
                        {formatDate(slot.available_date)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTime(slot.start_time)} –{" "}
                        {formatTime(slot.end_time)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₹{slot.session_fee}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent sessions */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_sessions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No sessions yet
                    </TableCell>
                  </TableRow>
                )}
                {recent_sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {session.student.full_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {session.student.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(session.scheduled_date)}
                      <div className="text-[10px] text-muted-foreground">
                        {formatTime(session.start_time)} –{" "}
                        {formatTime(session.end_time)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {session.session_type}
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {session.session_mode.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          session.status === "completed"
                            ? "success"
                            : session.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          session.payment_status === "paid"
                            ? "success"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {session.payment_status}
                      </Badge>
                      {session.transaction_id && (
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {session.transaction_id}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {session.session_fee !== null
                        ? `₹${session.session_fee}`
                        : "Free"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Wallet transactions */}
        {wallet && wallet.transactions.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Wallet Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallet.transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm">
                        {formatDate(txn.created_at)}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {txn.type}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {txn.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ₹{txn.amount}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₹{txn.balance_after}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
