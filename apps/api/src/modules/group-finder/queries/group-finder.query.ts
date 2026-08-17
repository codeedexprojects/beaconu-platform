import { prisma, Prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import type {
  GroupFinderCourseMatch,
  GroupFinderResult,
  GroupFinderSpecializationOption,
  MatchGroupResponse,
  SeatAvailabilityLevel,
} from "@beaconu/types";
import type { MatchGroupInput } from "../validators/group-finder.validator";

// Seat-availability thresholds — no existing precedent anywhere in the
// codebase for this, so these are reasonable defaults (not derived from
// product spec) rather than tuned numbers. Easy to adjust in one place.
const HIGH_AVAILABILITY_RATIO = 0.3;

function availabilityFromSeats(
  totalSeats: number,
  openSeats: number,
): { level: SeatAvailabilityLevel; label: string } {
  if (totalSeats <= 0) {
    return { level: "unknown", label: "Seats Available" };
  }
  if (openSeats <= 0) {
    return { level: "waitlist", label: "Waitlist Open" };
  }
  const ratio = openSeats / totalSeats;
  if (ratio > HIGH_AVAILABILITY_RATIO) {
    return { level: "high", label: "High Availability" };
  }
  return { level: "limited", label: "Limited Seats Left" };
}

const CANDIDATE_COURSE_SELECT = {
  id: true,
  name: true,
  code: true,
  studyLevelId: true,
  disciplineId: true,
  collegeId: true,
  studyLevel: { select: { name: true } },
  discipline: { select: { name: true } },
  college: {
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      institutionGroupMember: {
        select: { group: { select: { id: true, name: true } } },
      },
    },
  },
} satisfies Prisma.CourseSelect;

type CandidateCourse = Prisma.CourseGetPayload<{
  select: typeof CANDIDATE_COURSE_SELECT;
}>;

interface GroupBucket {
  groupId: string | null;
  groupName: string;
  city: string | null;
  state: string | null;
  // friendIndex -> the course match chosen for that friend within this group
  friendMatches: Map<number, CandidateCourse>;
}

export class GroupFinderQuery {
  static async match(input: MatchGroupInput): Promise<MatchGroupResponse> {
    const { friends, preferred_city, preferred_state } = input;

    // Each friend picks a CourseMaster (platform catalog) entry, e.g.
    // "B.Tech Computer Science Engineering" — resolve it to the Discipline
    // (always present) and Study Level (optional on CourseMaster) that are
    // actually matched against real per-college courses below. Stream is
    // derived transitively through the Discipline, never taken as input.
    const courseIds = Array.from(new Set(friends.map((f) => f.course_id)));
    const courseMasters = await prisma.courseMaster.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, disciplineId: true, studyLevelId: true },
    });
    const courseMasterById = new Map(courseMasters.map((c) => [c.id, c]));

    const resolvedByFriend = friends.map((f) => {
      const resolved = courseMasterById.get(f.course_id);
      if (!resolved) {
        throw new NotFoundError(`Course not found for friend "${f.name}"`);
      }
      return resolved;
    });

    const orConditions = resolvedByFriend.map((r) => ({
      disciplineId: r.disciplineId,
      ...(r.studyLevelId ? { studyLevelId: r.studyLevelId } : {}),
    }));

    const candidates = await prisma.course.findMany({
      where: {
        status: "active",
        OR: orConditions,
        college: {
          status: "active",
          ...(preferred_city && {
            city: { equals: preferred_city, mode: "insensitive" as const },
          }),
          ...(preferred_state && {
            state: { equals: preferred_state, mode: "insensitive" as const },
          }),
        },
      },
      select: CANDIDATE_COURSE_SELECT,
    });

    if (candidates.length === 0) {
      return { fullyMatched: [], partiallyMatched: [] };
    }

    // Bucket candidates by institution group (or the college itself, when
    // it isn't part of a group) — this is the actual "match" unit, since
    // two friends can each be satisfied by a DIFFERENT sub-college within
    // the same group (e.g. one friend's engineering course at Institute A,
    // another friend's arts course at Institute B, same parent group).
    const buckets = new Map<string, GroupBucket>();

    friends.forEach((friend, friendIndex) => {
      const resolved = resolvedByFriend[friendIndex];
      for (const course of candidates) {
        if (
          course.disciplineId !== resolved.disciplineId ||
          (resolved.studyLevelId &&
            course.studyLevelId !== resolved.studyLevelId)
        ) {
          continue;
        }
        const group = course.college.institutionGroupMember?.group ?? null;
        const bucketKey = group?.id ?? `college:${course.collegeId}`;

        let bucket = buckets.get(bucketKey);
        if (!bucket) {
          bucket = {
            groupId: group?.id ?? null,
            groupName: group?.name ?? course.college.name,
            city: course.college.city,
            state: course.college.state,
            friendMatches: new Map(),
          };
          buckets.set(bucketKey, bucket);
        }
        // First match found for this friend within this group wins — good
        // enough for a first pass; not optimizing for "best" seat
        // availability across multiple candidate colleges in the group.
        if (!bucket.friendMatches.has(friendIndex)) {
          bucket.friendMatches.set(friendIndex, course);
        }
      }
    });

    const matchedCourses = Array.from(buckets.values()).flatMap((b) =>
      Array.from(b.friendMatches.values()),
    );

    const [specializationsByKey, availabilityByCourseId] = await Promise.all([
      this.loadAvailableSpecializations(matchedCourses),
      this.loadSeatAvailability(matchedCourses.map((c) => c.id)),
    ]);

    const fullyMatched: GroupFinderResult[] = [];
    const partiallyMatched: GroupFinderResult[] = [];

    for (const bucket of buckets.values()) {
      const matchedFriendCount = bucket.friendMatches.size;
      const matches: GroupFinderCourseMatch[] = [];
      const unmatchedFriendNames: string[] = [];

      friends.forEach((friend, friendIndex) => {
        const course = bucket.friendMatches.get(friendIndex);
        if (!course) {
          unmatchedFriendNames.push(friend.name);
          return;
        }
        const availability = availabilityByCourseId.get(course.id) ?? {
          level: "unknown" as const,
          label: "Seats Available",
        };
        matches.push({
          friendName: friend.name,
          collegeId: course.collegeId,
          collegeName: course.college.name,
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          studyLevelName: course.studyLevel.name,
          disciplineName: course.discipline.name,
          availability: availability.level,
          availabilityLabel: availability.label,
          availableSpecializations:
            specializationsByKey.get(
              `${course.collegeId}:${course.studyLevelId}`,
            ) ?? [],
        });
      });

      const result: GroupFinderResult = {
        groupId: bucket.groupId,
        groupName: bucket.groupName,
        city: bucket.city,
        state: bucket.state,
        matchedFriendCount,
        totalFriendCount: friends.length,
        isFullyMatched: matchedFriendCount === friends.length,
        matches,
        unmatchedFriendNames,
      };

      if (result.isFullyMatched) {
        fullyMatched.push(result);
      } else {
        partiallyMatched.push(result);
      }
    }

    const byMatchCountThenName = (a: GroupFinderResult, b: GroupFinderResult) =>
      b.matchedFriendCount - a.matchedFriendCount ||
      a.groupName.localeCompare(b.groupName);

    fullyMatched.sort(byMatchCountThenName);
    partiallyMatched.sort(byMatchCountThenName);

    return { fullyMatched, partiallyMatched };
  }

  /** Other active courses at the same college, under the same study level
   * (regardless of discipline) — backs the "Available Specializations"
   * dropdown on a matched course's card. Batched into one query for every
   * distinct (collegeId, studyLevelId) pair among the matched courses. */
  private static async loadAvailableSpecializations(
    matchedCourses: CandidateCourse[],
  ): Promise<Map<string, GroupFinderSpecializationOption[]>> {
    const pairs = new Map<
      string,
      { collegeId: string; studyLevelId: string }
    >();
    for (const c of matchedCourses) {
      pairs.set(`${c.collegeId}:${c.studyLevelId}`, {
        collegeId: c.collegeId,
        studyLevelId: c.studyLevelId,
      });
    }
    if (pairs.size === 0) return new Map();

    const rows = await prisma.course.findMany({
      where: {
        status: "active",
        OR: Array.from(pairs.values()),
      },
      select: {
        id: true,
        name: true,
        collegeId: true,
        studyLevelId: true,
        disciplineId: true,
        discipline: { select: { name: true } },
      },
    });

    const result = new Map<string, GroupFinderSpecializationOption[]>();
    for (const row of rows) {
      const key = `${row.collegeId}:${row.studyLevelId}`;
      const list = result.get(key) ?? [];
      list.push({
        courseId: row.id,
        disciplineId: row.disciplineId,
        disciplineName: row.discipline.name,
        courseName: row.name,
      });
      result.set(key, list);
    }
    return result;
  }

  /** Live seat availability for a course, scoped to that course's college's
   * currently-open admission cycle — summed across every active quota
   * seat row. No existing "availability label" logic anywhere in the
   * codebase to reuse; thresholds are defined locally in this file. */
  private static async loadSeatAvailability(
    courseIds: string[],
  ): Promise<Map<string, { level: SeatAvailabilityLevel; label: string }>> {
    if (courseIds.length === 0) return new Map();

    const rows = await prisma.admissionCycleCourse.findMany({
      where: {
        courseId: { in: courseIds },
        isActive: true,
        admissionCycle: { status: "open" },
      },
      select: {
        courseId: true,
        quotaSeats: {
          where: { isActive: true },
          select: { totalSeats: true, openSeats: true },
        },
      },
    });

    const totals = new Map<string, { total: number; open: number }>();
    for (const row of rows) {
      const acc = totals.get(row.courseId) ?? { total: 0, open: 0 };
      for (const seat of row.quotaSeats) {
        acc.total += seat.totalSeats ?? 0;
        acc.open += seat.openSeats ?? 0;
      }
      totals.set(row.courseId, acc);
    }

    const result = new Map<
      string,
      { level: SeatAvailabilityLevel; label: string }
    >();
    for (const [courseId, { total, open }] of totals) {
      result.set(courseId, availabilityFromSeats(total, open));
    }
    return result;
  }
}
