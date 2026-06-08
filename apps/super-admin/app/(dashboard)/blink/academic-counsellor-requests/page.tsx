"use client";

import { GraduationCap } from "lucide-react";
import { CounsellorRequestsView } from "@/components/counsellors/counsellor-requests-view";

export default function AcademicCounsellorRequestsPage() {
  return (
    <CounsellorRequestsView
      counsellorType="academic"
      title="Academic Counsellor Requests"
      description="Review and approve Academic Counsellor applications from Blink"
      trackLabel="Academic Counsellor"
      trackIcon={GraduationCap}
      avatarClassName="bg-violet-100 text-violet-700"
    />
  );
}
