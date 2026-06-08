import type { Metadata } from "next";
import { RegisterShell } from "@/components/register/register-shell";
import { CounsellorRequestForm } from "@/components/register/counsellor-request-form";
import { getBlinkRole } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Join as an Academic Counsellor — Blink",
};

export default function AcademicCounsellorRequestPage() {
  const role = getBlinkRole("academic-counsellor")!;

  return (
    <RegisterShell role={role}>
      <CounsellorRequestForm counsellorType="academic" />
    </RegisterShell>
  );
}
