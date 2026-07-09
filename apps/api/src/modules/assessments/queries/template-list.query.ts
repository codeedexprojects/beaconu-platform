import { NotFoundError } from "@/shared/errors";
import { TemplateRepository } from "../repositories/template.repository";
import type {
  AssessmentTemplateItem,
  NegativeMarkingMode,
  TemplateStatus,
} from "@beaconu/types";

type TemplateWithSections = NonNullable<
  Awaited<ReturnType<typeof TemplateRepository.findById>>
>;

function mapTemplate(row: TemplateWithSections): AssessmentTemplateItem {
  const settings = row.settings as {
    negativeMarkingMode?: NegativeMarkingMode;
  };
  return {
    id: row.id,
    collegeId: row.collegeId,
    name: row.name,
    templateType: row.templateType,
    totalQuestions: row.totalQuestions,
    totalMarks: Number(row.totalMarks),
    totalDurationMins: row.totalDurationMins,
    status: row.status as TemplateStatus,
    negativeMarkingMode: settings.negativeMarkingMode ?? "none",
    sections: row.templateSections.map((ts) => ({
      id: ts.id,
      sectionId: ts.sectionId,
      sectionName: ts.section.name,
      questionCount: ts.questionCount,
      timeLimitMins: ts.timeLimitMins,
      sectionWeightage:
        ts.sectionWeightage === null ? null : Number(ts.sectionWeightage),
      sortOrder: ts.sortOrder,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class TemplateListQuery {
  static async listForCollegeAdmin(
    collegeId: string,
  ): Promise<AssessmentTemplateItem[]> {
    const rows = await TemplateRepository.listByCollege(collegeId);
    return rows.map(mapTemplate);
  }

  static async getById(
    collegeId: string,
    id: string,
  ): Promise<AssessmentTemplateItem> {
    const row = await TemplateRepository.findById(id);
    if (!row || row.collegeId !== collegeId) {
      throw new NotFoundError("Assessment template not found");
    }
    return mapTemplate(row);
  }
}
