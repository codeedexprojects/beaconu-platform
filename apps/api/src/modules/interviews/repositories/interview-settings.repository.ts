import { prisma } from "@beaconu/db";

const SETTINGS_SELECT = {
  collegeId: true,
  allowGmeet: true,
  allowOnCampus: true,
  gmeetHeading: true,
  gmeetDescription: true,
  gmeetInstructions: true,
  onCampusHeading: true,
  onCampusDescription: true,
  onCampusInstructions: true,
  updatedAt: true,
} as const;

export interface InterviewSettingsUpdateData {
  allowGmeet?: boolean;
  allowOnCampus?: boolean;
  gmeetHeading?: string;
  gmeetDescription?: string;
  gmeetInstructions?: string[];
  onCampusHeading?: string;
  onCampusDescription?: string;
  onCampusInstructions?: string[];
}

function toPrismaData(data: InterviewSettingsUpdateData) {
  return {
    ...(data.allowGmeet !== undefined && { allowGmeet: data.allowGmeet }),
    ...(data.allowOnCampus !== undefined && {
      allowOnCampus: data.allowOnCampus,
    }),
    ...(data.gmeetHeading !== undefined && {
      gmeetHeading: data.gmeetHeading,
    }),
    ...(data.gmeetDescription !== undefined && {
      gmeetDescription: data.gmeetDescription,
    }),
    ...(data.gmeetInstructions !== undefined && {
      gmeetInstructions: data.gmeetInstructions,
    }),
    ...(data.onCampusHeading !== undefined && {
      onCampusHeading: data.onCampusHeading,
    }),
    ...(data.onCampusDescription !== undefined && {
      onCampusDescription: data.onCampusDescription,
    }),
    ...(data.onCampusInstructions !== undefined && {
      onCampusInstructions: data.onCampusInstructions,
    }),
  };
}

export class InterviewSettingsRepository {
  static async findByCollege(collegeId: string) {
    return prisma.interviewSettings.findUnique({
      where: { collegeId },
      select: SETTINGS_SELECT,
    });
  }

  /** Find-or-create-then-update in one call — there's no separate "create
   * settings" step from the college-admin's point of view, just "update
   * settings" (defaults apply until the first real edit). */
  static async upsert(collegeId: string, data: InterviewSettingsUpdateData) {
    const fields = toPrismaData(data);
    return prisma.interviewSettings.upsert({
      where: { collegeId },
      create: { collegeId, ...fields },
      update: fields,
      select: SETTINGS_SELECT,
    });
  }
}
