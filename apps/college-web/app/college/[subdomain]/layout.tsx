import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { publicCollegeService } from "@/lib/services/public-college.service";

interface CollegeLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function CollegeLayout({
  children,
  params,
}: CollegeLayoutProps) {
  const { subdomain } = await params;

  let college;
  try {
    college = await publicCollegeService.getBySlug(subdomain);
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Public College Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {college.logoUrl ? (
              <img
                src={college.logoUrl}
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight">
              {college.name}
            </span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6">
            <a
              href="#"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </a>
            <a
              href="#programs"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Programs
            </a>
            <a
              href="#campuses"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block"
            >
              Campuses
            </a>

            <div className="h-4 w-px bg-border mx-2 hidden sm:block"></div>

            <Button size="sm" className="hidden sm:inline-flex">
              Apply Now
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${subdomain}/login`}>Student Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      {/* Public College Footer */}
      <footer className="bg-muted py-12 mt-12 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            {college.logoUrl ? (
              <img
                src={college.logoUrl}
                alt="Logo"
                className="h-6 w-6 object-contain grayscale opacity-50"
              />
            ) : (
              <Building2 className="h-6 w-6 opacity-50" />
            )}
            <span className="font-semibold text-foreground/50">
              {college.name}
            </span>
          </div>
          <p className="text-sm max-w-md mx-auto mb-6">
            Empowering students with quality education. Explore our programs and
            start your journey today.
          </p>
          <div className="text-xs">
            &copy; {new Date().getFullYear()} {college.name}. All rights
            reserved. <br />
            Powered by{" "}
            <span className="font-semibold text-primary">Beaconu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
