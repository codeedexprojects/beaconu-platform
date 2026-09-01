import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { WhatIsBlinkSection } from "@/components/landing/what-is-blink-section";
import { RoleCardsSection } from "@/components/landing/role-cards-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <RoleCardsSection />
        <WhatIsBlinkSection />
        <HowItWorksSection />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
