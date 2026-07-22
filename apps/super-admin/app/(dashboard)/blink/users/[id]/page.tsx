"use client";

import { useParams } from "next/navigation";
import { BlinkUserDetailView } from "@/components/blink/blink-user-detail-view";

export default function BlinkUserDetailPage() {
  const params = useParams<{ id: string }>();
  return <BlinkUserDetailView userId={params.id} />;
}
