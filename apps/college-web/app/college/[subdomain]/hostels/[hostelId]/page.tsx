import { notFound } from "next/navigation";
import { getHostelDetail } from "@/lib/services/public-hostel.service";
import { BackToCollegeLink } from "@/components/college-landing/back-to-college-link";
import { HostelHeader } from "@/components/hostel-detail/hostel-header";
import { HostelRoomsSection } from "@/components/hostel-detail/hostel-rooms-section";
import {
  HostelFeesBlock,
  ParkingBlock,
  SimplePlanBlock,
} from "@/components/hostel-detail/hostel-fee-blocks";
import { HostelSafetyAmenities } from "@/components/hostel-detail/hostel-safety-amenities";
import { HostelReviewsSection } from "@/components/hostel-detail/hostel-reviews-section";
import { HostelLocationSection } from "@/components/hostel-detail/hostel-location-section";

interface HostelDetailPageProps {
  params: Promise<{ subdomain: string; hostelId: string }>;
}

export default async function HostelDetailPage({
  params,
}: HostelDetailPageProps) {
  const { subdomain, hostelId } = await params;

  let hostel;
  try {
    hostel = await getHostelDetail(subdomain, hostelId);
  } catch {
    notFound();
  }

  return (
    <>
      {hostel.header ? <HostelHeader header={hostel.header} /> : null}

      <BackToCollegeLink
        subdomain={subdomain}
        href={`/college/${subdomain}/hostels`}
        label="Back to hostels"
      />

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        <HostelRoomsSection
          title={hostel.rooms_and_types?.title}
          totalIntakeLabel={hostel.rooms_and_types?.total_intake_label}
          items={hostel.rooms_and_types?.items ?? []}
        />

        {hostel.hostel_fees ||
        hostel.mess_plan ||
        hostel.laundry_charges ||
        hostel.gym_packages ||
        hostel.parking_charges ||
        hostel.other_charges ? (
          <section>
            <h2 className="text-xl font-bold tracking-tight">Fees & Charges</h2>
            <div className="mt-5 space-y-8">
              {hostel.hostel_fees ? (
                <HostelFeesBlock fees={hostel.hostel_fees} />
              ) : null}
              {hostel.mess_plan ? (
                <SimplePlanBlock block={hostel.mess_plan} />
              ) : null}
              {hostel.laundry_charges ? (
                <SimplePlanBlock block={hostel.laundry_charges} />
              ) : null}
              {hostel.gym_packages ? (
                <SimplePlanBlock block={hostel.gym_packages} />
              ) : null}
              {hostel.other_charges ? (
                <SimplePlanBlock block={hostel.other_charges} />
              ) : null}
              {hostel.parking_charges ? (
                <ParkingBlock block={hostel.parking_charges} />
              ) : null}
            </div>
          </section>
        ) : null}

        <HostelSafetyAmenities
          safety={hostel.safety_and_warden}
          amenities={hostel.amenities}
          rules={hostel.rules}
        />

        {hostel.reviews_and_ratings ? (
          <HostelReviewsSection reviews={hostel.reviews_and_ratings} />
        ) : null}

        {hostel.location_and_access ? (
          <HostelLocationSection location={hostel.location_and_access} />
        ) : null}
      </div>
    </>
  );
}
