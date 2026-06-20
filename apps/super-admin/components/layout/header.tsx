"use client";

import { Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-cream px-6">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-bold text-navy-dark font-serif tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-label mt-0.5">{description}</p>
          )}
        </div>
        {children}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-9 w-9 border-border text-gray-label hover:text-navy-dark hover:bg-white"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-9 w-9 border-border text-gray-label hover:text-navy-dark hover:bg-white relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold border-2 border-cream"></span>
        </Button>
      </div>
    </header>
  );
}
