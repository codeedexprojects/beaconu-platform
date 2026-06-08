import { GraduationCap, HeartHandshake, type LucideIcon } from "lucide-react";

export type BlinkRoleSlug = "academic-counsellor" | "mindcare-counsellor";

export interface BlinkRole {
  slug: BlinkRoleSlug;
  title: string;
  shortLabel: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
  ctaLabel: string;
}

export const BLINK_ROLES: BlinkRole[] = [
  {
    slug: "academic-counsellor",
    title: "Academic Counsellor",
    shortLabel: "Academic Counsellor",
    tagline: "Guide students toward the right course",
    description:
      "Help students choose the right stream, course, and college through one-on-one academic counselling sessions on the BeaconU platform.",
    icon: GraduationCap,
    highlights: [
      "Flexible, session-based engagements",
      "Reach students across BeaconU's network of colleges",
      "Get paid through the BeaconU counsellor wallet",
    ],
    ctaLabel: "Send a request to join",
  },
  {
    slug: "mindcare-counsellor",
    title: "MindCare Counsellor",
    shortLabel: "MindCare Counsellor",
    tagline: "Support student mental wellbeing",
    description:
      "Licensed mental health professionals who provide confidential counselling sessions to students through BeaconU's MindCare program.",
    icon: HeartHandshake,
    highlights: [
      "Make a real impact on student wellbeing",
      "Set your own availability for sessions",
      "Confidential, secure session management tools",
    ],
    ctaLabel: "Send a request to join",
  },
];

export function getBlinkRole(slug: string): BlinkRole | undefined {
  return BLINK_ROLES.find((role) => role.slug === slug);
}
