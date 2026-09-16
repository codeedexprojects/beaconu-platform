import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileDown } from "lucide-react";
import { LEGAL_DOCUMENT_TYPES, type LegalDocumentType } from "@beaconu/types";
import {
  getCollegeBySlug,
  getCollegeLegalDocument,
  getCollegeOverviewSection,
} from "@/lib/services/public-college.service";
import { SiteFooter } from "@/components/college-landing/site-footer";

// Policies change rarely; unpublishing should still take effect the same hour.
export const revalidate = 3600;

interface PolicyPageProps {
  params: Promise<{ subdomain: string; docType: string }>;
}

// URLs read better hyphenated (/policies/terms-and-conditions) than the
// underscored docType the API uses.
function toLegalDocumentType(slug: string): LegalDocumentType | null {
  const docType = slug.replace(/-/g, "_");
  return (LEGAL_DOCUMENT_TYPES as readonly string[]).includes(docType)
    ? (docType as LegalDocumentType)
    : null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { subdomain, docType } = await params;
  const legalDocType = toLegalDocumentType(docType);
  if (!legalDocType) notFound();

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  // 404 here means the college hasn't published this policy yet.
  const document = await getCollegeLegalDocument(
    collegeDetails.id,
    legalDocType,
  ).catch(() => null);
  if (!document) notFound();

  const overviewData = (
    await getCollegeOverviewSection(collegeDetails.id).catch(() => null)
  )?.data;

  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href={`/college/${subdomain}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-headerTeal"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {collegeDetails.name}
        </Link>

        <header className="mt-6 border-b border-border/60 pb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {document.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {document.effectiveFrom
              ? `Effective ${formatDate(document.effectiveFrom)} · `
              : ""}
            Last updated {formatDate(document.updatedAt)}
          </p>
          {document.documentUrl ? (
            <a
              href={document.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-field"
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </a>
          ) : null}
        </header>

        {/* Authored by college staff in the admin panel — trusted HTML. */}
        <article
          className="policy-content mt-8 space-y-4 text-sm leading-7 text-foreground"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
      </main>

      <SiteFooter
        collegeName={collegeDetails.name}
        logoUrl={collegeDetails.logoUrl}
        subdomain={subdomain}
        address={
          overviewData?.location?.address ||
          [collegeDetails.address, collegeDetails.city, collegeDetails.state]
            .filter(Boolean)
            .join(", ")
        }
        mapLink={overviewData?.location?.map_link}
        social={overviewData?.social ?? []}
      />
    </>
  );
}
