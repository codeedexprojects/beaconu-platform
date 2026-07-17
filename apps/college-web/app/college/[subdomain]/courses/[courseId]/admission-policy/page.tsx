import { notFound } from "next/navigation";
import {
  getAdmissionPolicyTab,
  getEligibilityCriteria,
} from "@/lib/services/public-course.service";
import { AdmissionPolicySection } from "@/components/course-detail/admission-policy-section";
import { EligibilityCriteriaWidget } from "@/components/course-detail/eligibility-criteria-widget";

interface AdmissionPolicyPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function AdmissionPolicyPage({
  params,
}: AdmissionPolicyPageProps) {
  const { subdomain, courseId } = await params;

  const [tab, eligibility] = await Promise.all([
    getAdmissionPolicyTab(subdomain, courseId).catch(() => null),
    getEligibilityCriteria(subdomain, courseId).catch(() => null),
  ]);

  if (!tab) notFound();

  return (
    <>
      <AdmissionPolicySection policy={tab.data} />
      {eligibility ? (
        <EligibilityCriteriaWidget
          slug={subdomain}
          courseId={courseId}
          studentTypes={eligibility.student_types ?? []}
          quotas={eligibility.quotas ?? []}
        />
      ) : null}
    </>
  );
}
