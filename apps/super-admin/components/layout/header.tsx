"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  const [showLogout, setShowLogout] = useState(false);

  const admin = useAuthStore((state) => state.admin);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const initials = admin?.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    clearAuth();
    window.location.assign("/login");
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-base font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          {children}
        </div>

        {/* Avatar + logout trigger */}
        <button
          onClick={() => setShowLogout(true)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={admin?.avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-none">
              {admin?.fullName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">
              {admin?.email}
            </p>
          </div>
          <LogOut className="h-4 w-4 text-muted-foreground ml-1" />
        </button>
      </header>

      {/* Logout confirmation modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mx-auto">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-base font-semibold">Sign out?</h2>
              <p className="text-sm text-muted-foreground">
                You will be returned to the login page.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
