"use client";

import { useState } from "react";
import { ScholarshipCategoriesTab } from "@/components/scholarships/categories-tab";
import { ScholarshipRequestsTab } from "@/components/scholarships/requests-tab";

const SUB_TABS = [
  { id: "categories", label: "Categories" },
  { id: "requests", label: "Requests" },
] as const;

type SubTab = (typeof SUB_TABS)[number]["id"];

export default function ScholarshipsPage() {
  const [subTab, setSubTab] = useState<SubTab>("categories");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Scholarships
        </h1>
        <p className="text-sm text-muted-foreground">
          Define scholarship categories and review student requests.
        </p>
      </div>

      <div className="flex border-b overflow-x-auto scrollbar-none gap-2 pb-2">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
              subTab === tab.id
                ? "border-gold bg-gold text-white shadow-sm"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "categories" && <ScholarshipCategoriesTab />}
      {subTab === "requests" && <ScholarshipRequestsTab />}
    </div>
  );
}
