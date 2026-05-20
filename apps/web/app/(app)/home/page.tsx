import { HeroSection } from "@/components/home/HeroSection";
import { StarterGuide } from "@/components/home/StarterGuide";
import { UniversitiesSection } from "@/components/home/UniversitiesSection";
import { ShortsSection } from "@/components/home/ShortsSection";
import { InstitutesSection } from "@/components/home/InstitutesSection";
import { ExploreInterests } from "@/components/home/ExploreInterests";
import { InsightsUpdates } from "@/components/home/InsightsUpdates";
import { StudentSupportServices } from "@/components/home/StudentSupportServices";
import { OnlyAtBeaconU } from "@/components/home/OnlyAtBeaconU";
import { VideoTestimonials } from "@/components/home/VideoTestimonials";
import { HelpAndTrust } from "@/components/home/HelpAndTrust";

export default function StudentHomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <div className="max-w-7xl mx-auto space-y-7 sm:space-y-9 pb-12 pt-2">
        <StarterGuide />
        <UniversitiesSection />
        <ShortsSection />
        <InstitutesSection />
        <ExploreInterests />
        <InsightsUpdates />
        <StudentSupportServices />
        <OnlyAtBeaconU />
        <VideoTestimonials />
        <HelpAndTrust />
      </div>
    </main>
  );
}
