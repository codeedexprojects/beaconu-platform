"use client";

import { useRef } from "react";
import { SiteNav } from "@/components/landing/site-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { OnboardingForm } from "@/components/landing/onboarding-form";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage(): React.JSX.Element {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SiteNav onPartnerClick={scrollToForm} />
      <HeroSection onRequestOnboarding={scrollToForm} />
      <StatsSection />
      <FeaturesSection />
      <OnboardingForm ref={formRef} />
      <SiteFooter />
    </>
  );
}
