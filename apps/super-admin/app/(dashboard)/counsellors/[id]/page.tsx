"use client";

import { useParams } from "next/navigation";
import { CounsellorDetailView } from "@/components/counsellors/counsellor-detail-view";

export default function CounsellorDetailPage() {
  const params = useParams<{ id: string }>();
  return <CounsellorDetailView counsellorId={params.id} />;
}
