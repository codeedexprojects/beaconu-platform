import { ConflictError } from "@/shared/errors";
import {
  InterviewSettingsRepository,
  type InterviewSettingsUpdateData,
} from "../repositories/interview-settings.repository";
import type {
  InterviewSettingsItem,
  UpdateInterviewModeInstructionsInput,
} from "@beaconu/types";

type SettingsRow = NonNullable<
  Awaited<ReturnType<typeof InterviewSettingsRepository.findByCollege>>
>;

function mapSettings(row: SettingsRow): InterviewSettingsItem {
  return {
    collegeId: row.collegeId,
    allowGmeet: row.allowGmeet,
    allowOnCampus: row.allowOnCampus,
    gmeet: {
      heading: row.gmeetHeading,
      description: row.gmeetDescription,
      instructions: (row.gmeetInstructions as string[] | null) ?? [],
    },
    onCampus: {
      heading: row.onCampusHeading,
      description: row.onCampusDescription,
      instructions: (row.onCampusInstructions as string[] | null) ?? [],
    },
    updatedAt: row.updatedAt.toISOString(),
  };
}

const DEFAULT_SETTINGS: Omit<InterviewSettingsItem, "collegeId" | "updatedAt"> =
  {
    allowGmeet: true,
    allowOnCampus: true,
    gmeet: { heading: null, description: null, instructions: [] },
    onCampus: { heading: null, description: null, instructions: [] },
  };

export interface UpdateInterviewSettingsData {
  allowGmeet?: boolean;
  allowOnCampus?: boolean;
  gmeet?: UpdateInterviewModeInstructionsInput;
  onCampus?: UpdateInterviewModeInstructionsInput;
}

function flattenModeInstructions(
  prefix: "gmeet" | "onCampus",
  data?: UpdateInterviewModeInstructionsInput,
): Partial<InterviewSettingsUpdateData> {
  if (!data) return {};
  const heading = `${prefix}Heading` as const;
  const description = `${prefix}Description` as const;
  const instructions = `${prefix}Instructions` as const;
  return {
    ...(data.heading !== undefined && { [heading]: data.heading }),
    ...(data.description !== undefined && { [description]: data.description }),
    ...(data.instructions !== undefined && {
      [instructions]: data.instructions,
    }),
  };
}

export class InterviewSettingsService {
  static async get(collegeId: string): Promise<InterviewSettingsItem> {
    const row = await InterviewSettingsRepository.findByCollege(collegeId);
    if (!row) {
      return {
        collegeId,
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
    }
    return mapSettings(row);
  }

  static async update(
    collegeId: string,
    data: UpdateInterviewSettingsData,
  ): Promise<InterviewSettingsItem> {
    const row = await InterviewSettingsRepository.upsert(collegeId, {
      ...(data.allowGmeet !== undefined && { allowGmeet: data.allowGmeet }),
      ...(data.allowOnCampus !== undefined && {
        allowOnCampus: data.allowOnCampus,
      }),
      ...flattenModeInstructions("gmeet", data.gmeet),
      ...flattenModeInstructions("onCampus", data.onCampus),
    });
    return mapSettings(row);
  }

  /** Gate used by InterviewSlotService.create()/update() — a mode can only
   * be used for a NEW/changed slot if it's currently enabled. A college
   * that's never configured settings has both modes open by default (see
   * DEFAULT_SETTINGS), so this never blocks anyone who hasn't opted in to
   * restricting modes. */
  static async assertModeAllowed(collegeId: string, mode: string) {
    const settings = await this.get(collegeId);
    const allowed =
      (mode === "gmeet" && settings.allowGmeet) ||
      (mode === "on_campus" && settings.allowOnCampus);
    if (!allowed) {
      throw new ConflictError(
        `${mode === "gmeet" ? "Google Meet" : "On Campus"} slots are currently disabled for this college`,
      );
    }
  }
}
