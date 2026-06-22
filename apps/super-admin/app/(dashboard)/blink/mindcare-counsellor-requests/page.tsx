"use client";

import { HeartHandshake } from "lucide-react";
import { CounsellorRequestsView } from "@/components/counsellors/counsellor-requests-view";

export default function MindcareCounsellorRequestsPage() {
  return (
    <CounsellorRequestsView
      counsellorType="mindcare"
      title="MindCare Counsellor Requests"
      description="Review and approve MindCare Counsellor applications from Blink"
      trackLabel="MindCare Counsellor"
      trackIcon={HeartHandshake}
      avatarClassName="bg-rose-100 text-rose-700"
    />
  );
}
