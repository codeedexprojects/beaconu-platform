import type { Metadata } from "next";
import { RegisterShell } from "@/components/register/register-shell";
import { CounsellorRequestForm } from "@/components/register/counsellor-request-form";
import { getBlinkRole } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Join as a MindCare Counsellor — Blink",
};

export default function MindCareCounsellorRequestPage() {
  const role = getBlinkRole("mindcare-counsellor")!;

  return (
    <RegisterShell role={role}>
      <CounsellorRequestForm counsellorType="mindcare" />
    </RegisterShell>
  );
}
