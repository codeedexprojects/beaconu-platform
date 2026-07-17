import { notFound } from "next/navigation";
import { getExamPolicyTab } from "@/lib/services/public-course.service";
import { ExamPolicySection } from "@/components/course-detail/exam-policy-section";

interface ExamPolicyPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function ExamPolicyPage({ params }: ExamPolicyPageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getExamPolicyTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return <ExamPolicySection policy={tab.data} />;
}
