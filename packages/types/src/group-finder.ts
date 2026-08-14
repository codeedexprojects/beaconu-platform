export interface GroupFinderFriendInput {
  name: string;
  study_level_id: string;
  discipline_id: string;
}

export interface MatchGroupInput {
  preferred_city?: string;
  preferred_state?: string;
  friends: GroupFinderFriendInput[];
}

export type SeatAvailabilityLevel = "high" | "limited" | "waitlist" | "unknown";

export interface GroupFinderSpecializationOption {
  courseId: string;
  disciplineId: string;
  disciplineName: string;
  courseName: string;
}

export interface GroupFinderCourseMatch {
  friendName: string;
  collegeId: string;
  collegeName: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studyLevelName: string;
  disciplineName: string;
  availability: SeatAvailabilityLevel;
  availabilityLabel: string;
  availableSpecializations: GroupFinderSpecializationOption[];
}

export interface GroupFinderResult {
  groupId: string | null;
  groupName: string;
  city: string | null;
  state: string | null;
  matchedFriendCount: number;
  totalFriendCount: number;
  isFullyMatched: boolean;
  matches: GroupFinderCourseMatch[];
  unmatchedFriendNames: string[];
}

export interface MatchGroupResponse {
  fullyMatched: GroupFinderResult[];
  partiallyMatched: GroupFinderResult[];
}
