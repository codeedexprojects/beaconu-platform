import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { TemplateRepository } from "../repositories/template.repository";
import { SectionRepository } from "../repositories/section.repository";
import type {
  CreateTemplateInput,
  NegativeMarkingMode,
  TemplateSectionInput,
  UpdateTemplateInput,
} from "@beaconu/types";

const WEIGHTAGE_TOLERANCE = 0.1;

export class TemplateService {
  private static async validateSections(
    collegeId: string,
    sections: TemplateSectionInput[],
  ) {
    if (sections.length === 0) {
      throw new ValidationError("Add at least one section");
    }

    for (const s of sections) {
      const section = await SectionRepository.findById(s.section_id);
      if (!section || section.collegeId !== collegeId) {
        throw new NotFoundError(
          `Assessment section "${s.section_id}" not found`,
        );
      }
      if (s.question_count <= 0) {
        throw new ValidationError("question_count must be greater than 0");
      }
      if (s.time_limit_mins <= 0) {
        throw new ValidationError("time_limit_mins must be greater than 0");
      }
    }

    const weightages = sections.map((s) => s.section_weightage);
    const providedCount = weightages.filter((w) => w !== undefined).length;
    if (providedCount > 0 && providedCount < sections.length) {
      throw new ValidationError(
        "Either provide section_weightage for every section, or omit it entirely",
      );
    }
    if (providedCount === sections.length) {
      const sum = weightages.reduce<number>((acc, w) => acc + (w ?? 0), 0);
      if (Math.abs(sum - 100) > WEIGHTAGE_TOLERANCE) {
        throw new ValidationError(
          `Section weightages must sum to 100 (got ${sum})`,
        );
      }
    }
  }

  static async create(collegeId: string, data: CreateTemplateInput) {
    await this.validateSections(collegeId, data.sections);

    return TemplateRepository.create(collegeId, {
      name: data.name,
      templateType: data.template_type ?? "admission",
      totalMarks: data.total_marks,
      totalDurationMins: data.total_duration_mins,
      negativeMarkingMode: data.negative_marking_mode ?? "none",
      instructions: data.instructions,
      sections: data.sections,
    });
  }

  private static async loadForCollege(id: string, collegeId: string) {
    const template = await TemplateRepository.findById(id);
    if (!template || template.collegeId !== collegeId) {
      throw new NotFoundError("Assessment template not found");
    }
    return template;
  }

  static async update(
    collegeId: string,
    id: string,
    data: UpdateTemplateInput,
  ) {
    await this.loadForCollege(id, collegeId);

    if (data.sections) {
      await this.validateSections(collegeId, data.sections);
    }

    return TemplateRepository.update(id, {
      name: data.name,
      templateType: data.template_type,
      totalMarks: data.total_marks,
      totalDurationMins: data.total_duration_mins,
      negativeMarkingMode: data.negative_marking_mode as
        | NegativeMarkingMode
        | undefined,
      instructions: data.instructions,
      sections: data.sections,
    });
  }

  static async activate(collegeId: string, id: string) {
    await this.loadForCollege(id, collegeId);
    const sectionCount = await TemplateRepository.countSections(id);
    if (sectionCount === 0) {
      throw new ConflictError("Add at least one section before activating");
    }
    return TemplateRepository.setStatus(id, "active");
  }

  static async archive(collegeId: string, id: string) {
    await this.loadForCollege(id, collegeId);
    return TemplateRepository.setStatus(id, "archived");
  }
}
