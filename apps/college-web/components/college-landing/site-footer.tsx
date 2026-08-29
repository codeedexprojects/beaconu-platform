import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import type { PublicCollegeOverviewSocial } from "@beaconu/types";

interface SiteFooterProps {
  collegeName: string;
  logoUrl?: string | null;
  subdomain: string;
  address?: string | null;
  mapLink?: string;
  social: PublicCollegeOverviewSocial[];
}

const QUICK_LINKS = [
  { label: "Code of Conduct", href: "code-of-conduct" },
  { label: "Institutions", href: "institutions" },
  { label: "Commute", href: "commute" },
  { label: "Happenings", href: "happenings" },
];

const ACADEMICS_LINKS = [
  { label: "Courses", href: "#courses" },
  { label: "Scholarships", href: "#scholarships" },
  { label: "Hostels", href: "hostels" },
  { label: "Libraries", href: "libraries" },
];

export function SiteFooter({
  collegeName,
  logoUrl,
  subdomain,
  address,
  mapLink,
  social,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={collegeName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-contain"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-headerTeal/10 text-headerTeal">
                  <Building2 className="h-5 w-5" />
                </span>
              )}
              <p className="text-sm font-bold leading-tight text-foreground">
                {collegeName}
              </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A premier institution of higher learning, dedicated to academic
              excellence and student success.
            </p>
            {social.length > 0 ? (
              <div className="mt-5 flex gap-3">
                {social.map((link, i) => (
                  <a
                    key={`${link.platform}-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:border-headerTeal hover:text-headerTeal"
                    aria-label={link.platform}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Quick Links
            </p>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/college/${subdomain}/${link.href}`}
                    className="text-sm text-muted-foreground hover:text-headerTeal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Academics
            </p>
            <ul className="mt-4 space-y-2.5">
              {ACADEMICS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={
                      link.href.startsWith("#")
                        ? `/college/${subdomain}${link.href}`
                        : `/college/${subdomain}/${link.href}`
                    }
                    className="text-sm text-muted-foreground hover:text-headerTeal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Contact Us
            </p>
            <div className="mt-4 space-y-3">
              {address ? (
                <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {address}
                </p>
              ) : null}
              <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                Contact via application portal
              </p>
              <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                Contact via application portal
              </p>
            </div>
            {mapLink ? (
              <a
                href={mapLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex h-24 w-full items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted text-sm font-medium text-headerTeal hover:bg-muted/70"
              >
                <MapPin className="h-4 w-4" />
                View on Maps
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {collegeName}. All Rights Reserved.
          </p>
          <p>Powered by BeaconU</p>
        </div>
      </div>
    </footer>
  );
}
