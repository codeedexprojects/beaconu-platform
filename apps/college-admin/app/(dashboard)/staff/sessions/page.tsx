"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Laptop,
  Smartphone,
  MonitorSmartphone,
  LogOut,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { parseUserAgent } from "@/lib/parse-user-agent";
import {
  useAllStaffSessions,
  useForceLogoutStaffSession,
} from "@/hooks/use-roles";
import type { AllStaffSessionDto } from "@/lib/services/colleges.service";

function SessionCard({
  session,
  onForceLogout,
  isLoggingOut,
}: {
  session: AllStaffSessionDto;
  onForceLogout: (session: AllStaffSessionDto) => void;
  isLoggingOut: boolean;
}) {
  const { label, isMobile } = parseUserAgent(session.userAgent);
  const DeviceIcon = isMobile ? Smartphone : Laptop;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 px-6 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary select-none">
          {session.staff.fullName.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">
              {session.staff.fullName}
            </p>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {session.staff.roleName}
            </span>
            {session.isCurrent && (
              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 border border-green-600/30">
                This device
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <DeviceIcon className="h-3 w-3 shrink-0" />
            {label} · {session.ipAddress ?? "Unknown IP"} · Last active{" "}
            {new Date(session.lastActiveAt).toLocaleString()}
          </p>
        </div>
      </div>
      {!session.isCurrent && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 px-2.5 text-xs text-destructive hover:text-destructive"
          disabled={isLoggingOut}
          onClick={() => onForceLogout(session)}
        >
          {isLoggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="mr-1 h-3.5 w-3.5" />
          )}
          Sign out
        </Button>
      )}
    </div>
  );
}

export default function ActiveSessionsPage() {
  const { data: sessions = [], isLoading } = useAllStaffSessions();
  const [sessionTarget, setSessionTarget] = useState<AllStaffSessionDto | null>(
    null,
  );

  const { mutate: forceLogout, isPending: isForcing } =
    useForceLogoutStaffSession(sessionTarget?.staff.id ?? "");

  function confirmForceLogout() {
    if (!sessionTarget) return;
    forceLogout(sessionTarget.id, {
      onSuccess: () => {
        toast.success(
          `Session signed out for "${sessionTarget.staff.fullName}"`,
        );
        setSessionTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MonitorSmartphone className="h-6 w-6" />
            Active Sessions
          </h1>
          <p className="text-sm text-muted-foreground">
            Every device currently signed in across your staff. Force sign-out
            takes effect immediately.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
              No active sessions right now.
            </div>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onForceLogout={setSessionTarget}
                isLoggingOut={isForcing && sessionTarget?.id === session.id}
              />
            ))
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={sessionTarget !== null}
        title="Sign Out Session"
        description={
          sessionTarget
            ? `Force sign out this device? "${sessionTarget.staff.fullName}" will need to log in again on it.`
            : ""
        }
        confirmLabel="Sign Out"
        variant="destructive"
        loading={isForcing}
        onCancel={() => setSessionTarget(null)}
        onConfirm={confirmForceLogout}
      />
    </div>
  );
}
