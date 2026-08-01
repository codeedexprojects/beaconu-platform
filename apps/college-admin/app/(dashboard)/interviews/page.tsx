"use client";

import { useState } from "react";
import { InterviewSlotsTab } from "@/components/interviews/slots-tab";
import { InterviewBookingsTab } from "@/components/interviews/bookings-tab";
import { InterviewReschedulesTab } from "@/components/interviews/reschedules-tab";
import { InterviewSettingsTab } from "@/components/interviews/settings-tab";

const SUB_TABS = [
  { id: "slots", label: "Slots" },
  { id: "bookings", label: "Bookings" },
  { id: "reschedules", label: "Reschedule Requests" },
  { id: "settings", label: "Settings" },
] as const;

type SubTab = (typeof SUB_TABS)[number]["id"];

export default function InterviewsPage() {
  const [subTab, setSubTab] = useState<SubTab>("slots");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
        <p className="text-sm text-muted-foreground">
          Schedule interview slots, review bookings, and handle reschedule
          requests.
        </p>
      </div>

      <div className="flex border-b overflow-x-auto scrollbar-none gap-2 pb-2">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`shrink-0 rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
              subTab === tab.id
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "slots" && <InterviewSlotsTab />}
      {subTab === "bookings" && <InterviewBookingsTab />}
      {subTab === "reschedules" && <InterviewReschedulesTab />}
      {subTab === "settings" && <InterviewSettingsTab />}
    </div>
  );
}
