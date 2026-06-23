import "dotenv/config";
import { prisma } from "./index";

async function main() {
  const courseId = process.argv[2] || "CRS-2";

  const course = await prisma.course.findFirst({ where: { id: courseId } });
  if (!course) {
    throw new Error(`Course ${courseId} not found`);
  }

  const metadata = (course.metadata ?? {}) as Record<string, unknown>;
  const tabData = (metadata.tabData ?? {}) as Record<string, unknown>;

  const demoGraphicsTabData = {
    tab: "demo_graphics",
    age_distribution: {
      data: [
        { label: "18 - 22 years", percent: 64 },
        { label: "23 - 26 years", percent: 22 },
        { label: "27 - 30 years", percent: 10 },
        { label: "30+ years", percent: 4 },
      ],
    },
    gender_diversity: [
      { label: "Male", percent: 60 },
      { label: "Female", percent: 38 },
      { label: "Others", percent: 2 },
    ],
    work_experience: [
      {
        icon: "https://cdn.iconsdb.example.com/icons/graduate-cap-people-orange.png",
        label: "Freshers",
        subtitle: "Directly after undergrad",
        percent: 45,
      },
      {
        icon: "https://cdn.iconsdb.example.com/icons/briefcase-orange.png",
        label: "1 - 3 Years",
        subtitle: "Junior professionals",
        percent: 35,
      },
      {
        icon: "https://cdn.iconsdb.example.com/icons/star-orange.png",
        label: "4+ Years",
        subtitle: "Senior/Leadership roles",
        percent: 20,
      },
    ],
    international_presence: [
      {
        flag: "https://cdn.flagicons.example.com/flags/india.png",
        country: "India",
        percent: 42,
      },
      {
        flag: "https://cdn.flagicons.example.com/flags/uae.png",
        country: "UAE",
        percent: 18,
      },
    ],
    national_presence: [
      { state: "Kerala", percent: 42 },
      { state: "Tamilnadu", percent: 18 },
    ],
  };

  const clubsAssociationsTabData = {
    tab: "clubs_associations",
    clubs: [
      {
        id: "club_nss",
        name: "NSS",
        category: "Service",
        cover_image: "",
        logo: "",
        details: {
          full_name: "National Service Scheme",
          category: "Service",
          about:
            "The National Service Scheme (NSS) is an Indian government-sponsored public service program conducted by the Ministry of Youth Affairs and Sports. Our college chapter is dedicated to fostering social responsibility and community engagement among students.",
          mission:
            "Not Me But You — the motto of NSS reflects democratic living and the need for selfless service. We identify community needs and involve students in problem-solving.",
          key_activities: [
            "Blood Donation Camps",
            "Tree Plantation Drives",
            "Rural Development Projects",
            "Health & Hygiene Awareness",
          ],
          cover_image: "",
          logo: "",
        },
        recent_events: {
          happenings_link: "",
          events: [
            {
              id: "event_1",
              title: "Annual Blood Donation Camp",
              thumbnail: "",
              link: "",
            },
            {
              id: "event_2",
              title: "Tree Plantation Drive 2024",
              thumbnail: "",
              link: "",
            },
          ],
        },
      },
      {
        id: "club_ieee",
        name: "IEEE",
        category: "Technical",
        cover_image: "",
        logo: "",
        details: {
          full_name: "IEEE Student Branch",
          category: "Technical",
          about:
            "The IEEE Student Branch promotes technology, innovation, and professional development. Members participate in global IEEE events, workshops, and competitions that sharpen technical acumen.",
          mission:
            "To advance technology for the benefit of humanity by nurturing student talent through hands-on learning and industry exposure.",
          key_activities: [
            "Technical Workshops",
            "Hackathons",
            "Industry Guest Lectures",
            "Paper Presentation Contests",
          ],
          cover_image: "",
          logo: "",
        },
        recent_events: {
          happenings_link: "",
          events: [
            {
              id: "event_1",
              title: "IEEE Tech Fest 2024",
              thumbnail: "",
              link: "",
            },
          ],
        },
      },
      {
        id: "club_cultural",
        name: "Kalakaar",
        category: "Cultural",
        cover_image: "",
        logo: "",
        details: {
          full_name: "Kalakaar Cultural Club",
          category: "Cultural",
          about:
            "Kalakaar is the premier cultural club celebrating art, music, dance, and drama. The club organises the annual cultural fest and provides a platform for students to showcase their creative talents.",
          mission:
            "To preserve and promote diverse art forms while giving every student a stage to express creativity and build confidence.",
          key_activities: [
            "Annual Cultural Fest",
            "Inter-College Dance Competition",
            "Nukkad Natak (Street Plays)",
            "Music & Photography Workshops",
          ],
          cover_image: "",
          logo: "",
        },
        recent_events: {
          happenings_link: "",
          events: [
            {
              id: "event_1",
              title: "Tarang Annual Cultural Fest",
              thumbnail: "",
              link: "",
            },
            {
              id: "event_2",
              title: "Independence Day Celebration",
              thumbnail: "",
              link: "",
            },
          ],
        },
      },
      {
        id: "club_sports",
        name: "Sports Council",
        category: "Sports",
        cover_image: "",
        logo: "",
        details: {
          full_name: "College Sports Council",
          category: "Sports",
          about:
            "The Sports Council coordinates all sporting activities on campus, encouraging physical fitness and competitive spirit. It manages inter-department and inter-college tournaments throughout the year.",
          mission:
            "To build a healthy and competitive campus community by promoting sportsmanship, teamwork, and physical well-being.",
          key_activities: [
            "Annual Sports Meet",
            "Inter-Department Cricket & Football Tournaments",
            "Yoga & Fitness Workshops",
            "State-Level Participation Support",
          ],
          cover_image: "",
          logo: "",
        },
        recent_events: {
          happenings_link: "",
          events: [
            {
              id: "event_1",
              title: "Annual Sports Meet 2024",
              thumbnail: "",
              link: "",
            },
          ],
        },
      },
    ],
  };

  await prisma.course.update({
    where: { id: courseId },
    data: {
      metadata: {
        ...metadata,
        tabData: {
          ...tabData,
          demo_graphics: demoGraphicsTabData,
          clubs_associations: clubsAssociationsTabData,
        },
      } as any,
    },
  });

  console.log(`Seeded demo_graphics and clubs_associations for ${courseId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
