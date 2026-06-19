export interface CollegeOverviewAmenity {
  label: string;
  icon: string;
}

const svgToDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const AMENITY_ICON_KEY_PREFIX = "amenity:";

const GLOBAL_AMENITY_ICON_SVGS: Record<string, string> = {
  wifi: svgToDataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#E8F4FF"/><path d="M16 26c9-8 23-8 32 0" fill="none" stroke="#0F6CBD" stroke-width="4" stroke-linecap="round"/><path d="M22 34c6-5 14-5 20 0" fill="none" stroke="#0F6CBD" stroke-width="4" stroke-linecap="round"/><path d="M28 42c2-2 6-2 8 0" fill="none" stroke="#0F6CBD" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="49" r="3" fill="#0F6CBD"/></svg>',
  ),
  toiletries: svgToDataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#F7F2FF"/><rect x="18" y="16" width="14" height="32" rx="5" fill="#7C4DFF"/><rect x="22" y="11" width="6" height="6" rx="2" fill="#B39DFF"/><path d="M38 22h8a4 4 0 0 1 4 4v18a8 8 0 0 1-8 8 8 8 0 0 1-8-8V26a4 4 0 0 1 4-4Z" fill="#A06BFF"/><path d="M38 31h12" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity=".9"/></svg>',
  ),
  bathrobes: svgToDataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#FFF4E6"/><path d="M24 16h16l7 13-5 21H22l-5-21 7-13Z" fill="#FF9F43"/><path d="M28 16l4 10 4-10" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 26v24" stroke="#FFF" stroke-width="3" stroke-linecap="round"/><path d="M26 34l12 6" stroke="#FFE7CC" stroke-width="3" stroke-linecap="round"/></svg>',
  ),
  smart_classrooms: svgToDataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#EAFBF3"/><rect x="14" y="16" width="36" height="24" rx="4" fill="#00A86B"/><rect x="20" y="22" width="24" height="12" rx="2" fill="#CFF7E3"/><path d="M32 40v8" stroke="#007E50" stroke-width="4" stroke-linecap="round"/><path d="M24 49h16" stroke="#007E50" stroke-width="4" stroke-linecap="round"/><circle cx="52" cy="25" r="6" fill="#9BE7C4"/><path d="M52 22v6" stroke="#007E50" stroke-width="2.5" stroke-linecap="round"/><path d="M49 25h6" stroke="#007E50" stroke-width="2.5" stroke-linecap="round"/></svg>',
  ),
};

const DEFAULT_COLLEGE_AMENITY_LABEL_TO_KEY: Record<string, string> = {
  wifi: `${AMENITY_ICON_KEY_PREFIX}wifi`,
  toiletries: `${AMENITY_ICON_KEY_PREFIX}toiletries`,
  bathrobes: `${AMENITY_ICON_KEY_PREFIX}bathrobes`,
  smart_classrooms: `${AMENITY_ICON_KEY_PREFIX}smart_classrooms`,
};

export const DEFAULT_COLLEGE_OVERVIEW_AMENITIES: CollegeOverviewAmenity[] = [
  { label: "Wi-Fi", icon: DEFAULT_COLLEGE_AMENITY_LABEL_TO_KEY.wifi },
  {
    label: "Toiletries",
    icon: DEFAULT_COLLEGE_AMENITY_LABEL_TO_KEY.toiletries,
  },
  { label: "Bathrobes", icon: DEFAULT_COLLEGE_AMENITY_LABEL_TO_KEY.bathrobes },
  {
    label: "Smart Classrooms",
    icon: DEFAULT_COLLEGE_AMENITY_LABEL_TO_KEY.smart_classrooms,
  },
];

const normalizeAmenityKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getDefaultCollegeOverviewAmenities = () =>
  DEFAULT_COLLEGE_OVERVIEW_AMENITIES.map((amenity) => ({ ...amenity }));

export const normalizeCollegeOverviewAmenities = (
  amenities: unknown,
): CollegeOverviewAmenity[] => {
  if (!Array.isArray(amenities)) {
    return [];
  }

  return amenities
    .map((amenity) => {
      if (typeof amenity === "string") {
        const label = amenity.trim();
        return label ? { label, icon: "" } : null;
      }

      if (!amenity || typeof amenity !== "object") {
        return null;
      }

      const label =
        typeof (amenity as { label?: unknown }).label === "string"
          ? (amenity as { label: string }).label.trim()
          : "";
      const icon =
        typeof (amenity as { icon?: unknown }).icon === "string"
          ? (amenity as { icon: string }).icon.trim()
          : "";

      return label ? { label, icon } : null;
    })
    .filter((amenity): amenity is CollegeOverviewAmenity => amenity !== null);
};

export const mergeCollegeOverviewAmenities = (
  amenities: unknown,
): CollegeOverviewAmenity[] => {
  const customAmenities = normalizeCollegeOverviewAmenities(amenities);
  const merged = new Map<string, CollegeOverviewAmenity>();

  for (const amenity of getDefaultCollegeOverviewAmenities()) {
    merged.set(normalizeAmenityKey(amenity.label), amenity);
  }

  for (const amenity of customAmenities) {
    const key = normalizeAmenityKey(amenity.label);
    const existing = merged.get(key);
    merged.set(key, {
      label: amenity.label || existing?.label || "",
      icon: amenity.icon || existing?.icon || "",
    });
  }

  return Array.from(merged.values());
};

export const resolveCollegeAmenityIcon = (
  icon?: string | null,
  label?: string | null,
) => {
  const rawIcon = typeof icon === "string" ? icon.trim() : "";
  if (rawIcon) {
    if (rawIcon.startsWith(AMENITY_ICON_KEY_PREFIX)) {
      return GLOBAL_AMENITY_ICON_SVGS[
        rawIcon.slice(AMENITY_ICON_KEY_PREFIX.length)
      ];
    }

    if (rawIcon.startsWith("data:image/") || /^https?:\/\//i.test(rawIcon)) {
      return rawIcon;
    }
  }

  const amenityKey = normalizeAmenityKey(label || "");
  const defaultIconKey = DEFAULT_COLLEGE_AMENITY_LABEL_TO_KEY[amenityKey];
  if (!defaultIconKey) {
    return null;
  }

  return GLOBAL_AMENITY_ICON_SVGS[
    defaultIconKey.slice(AMENITY_ICON_KEY_PREFIX.length)
  ];
};
