"use client";

import { ScholarshipRequestsTab } from "@/components/scholarships/requests-tab";

export default function ScholarshipRequestsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Scholarship Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and decide on student scholarship applications.
        </p>
      </div>

      <ScholarshipRequestsTab />
    </div>
  );
}
