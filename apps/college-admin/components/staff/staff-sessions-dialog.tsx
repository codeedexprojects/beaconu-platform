"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Laptop,
  Smartphone,
  MonitorSmartphone,
  LogOut,
  X,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useStaffSessions,
  useForceLogoutStaffSession,
  useForceLogoutAllStaffSessions,
} from "@/hooks/use-roles";
import type { StaffSessionDto } from "@/lib/services/colleges.service";
import { parseUserAgent } from "@/lib/parse-user-agent";

function SessionRow({
  session,
  onForceLogout,
  isLoggingOut,
}: {
  session: StaffSessionDto;
  onForceLogout: (session: StaffSessionDto) => void;
  isLoggingOut: boolean;
}) {
  const { label, isMobile } = parseUserAgent(session.userAgent);
  const DeviceIcon = isMobile ? Smartphone : Laptop;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <DeviceIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{label}</p>
            {session.isCurrent && (
              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 border border-green-600/30">
                This device
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {session.ipAddress ?? "Unknown IP"} · Last active{" "}
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

export function StaffSessionsDialog({
  staffId,
  staffName,
  onClose,
}: {
  staffId: string;
  staffName: string;
  onClose: () => void;
}) {
  const { data: sessions = [], isLoading } = useStaffSessions(staffId);
  const { mutate: forceLogoutOne, isPending: isForcingOne } =
    useForceLogoutStaffSession(staffId);
  const { mutate: forceLogoutAll, isPending: isForcingAll } =
    useForceLogoutAllStaffSessions(staffId);

  const [sessionTarget, setSessionTarget] = useState<StaffSessionDto | null>(
    null,
  );
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  function confirmForceLogoutOne() {
    if (!sessionTarget) return;
    forceLogoutOne(sessionTarget.id, {
      onSuccess: () => {
        toast.success("Session signed out");
        setSessionTarget(null);
      },
    });
  }

  function confirmForceLogoutAll() {
    forceLogoutAll(undefined, {
      onSuccess: () => {
        toast.success(`All sessions for "${staffName}" signed out`);
        setConfirmLogoutAll(false);
      },
    });
  }

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-2.5">
            <MonitorSmartphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold">Active Sessions</h2>
              <p className="text-xs text-muted-foreground">{staffName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No active sessions.
            </p>
          ) : (
            sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onForceLogout={setSessionTarget}
                isLoggingOut={isForcingOne}
              />
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-5">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={otherSessionsCount === 0 || isForcingAll}
            onClick={() => setConfirmLogoutAll(true)}
          >
            {isForcingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign out all other devices
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={sessionTarget !== null}
        title="Sign Out Session"
        description={
          sessionTarget
            ? `Force sign out this device? "${staffName}" will need to log in again on it.`
            : ""
        }
        confirmLabel="Sign Out"
        variant="destructive"
        loading={isForcingOne}
        onCancel={() => setSessionTarget(null)}
        onConfirm={confirmForceLogoutOne}
      />

      <ConfirmDialog
        open={confirmLogoutAll}
        title="Sign Out All Other Devices"
        description={`Force sign out all ${otherSessionsCount} other active session(s) for "${staffName}"? They'll need to log in again on each device.`}
        confirmLabel="Sign Out All"
        variant="destructive"
        loading={isForcingAll}
        onCancel={() => setConfirmLogoutAll(false)}
        onConfirm={confirmForceLogoutAll}
      />
    </div>
  );
}
