import { NotFoundError } from "@/shared/errors";
import { PaperRepository } from "../repositories/paper.repository";
import { TemplateRepository } from "../repositories/template.repository";
import { scoreAutoAnswer } from "../lib/scoring";
import type {
  AnswerKey,
  AnswerResponse,
  NegativeMarkingMode,
  QuestionContent,
  SubmitTrialInput,
  TrialPaperItem,
  TrialResult,
} from "@beaconu/types";

export class TrialService {
  private static async loadActiveTrialPaper(
    collegeId: string,
    templateId: string,
  ) {
    const paper = await PaperRepository.findActiveByTemplateAndType(
      templateId,
      "trial",
    );
    if (!paper || paper.template.collegeId !== collegeId) {
      throw new NotFoundError("No active trial paper for this assessment");
    }
    return paper;
  }

  static async getTrialPaper(
    collegeId: string,
    templateId: string,
  ): Promise<TrialPaperItem> {
    const paper = await this.loadActiveTrialPaper(collegeId, templateId);

    return {
      paperId: paper.id,
      paperCode: paper.paperCode,
      templateId: paper.templateId,
      questions: paper.paperQuestions.map((pq) => ({
        id: pq.question.id,
        sectionId: pq.sectionId,
        sectionName: pq.section.name,
        questionTypeId: pq.question.questionTypeId,
        content: pq.question.content as unknown as QuestionContent,
        marks: Number(pq.question.marks),
        scorable: pq.question.questionType.autoScorable,
      })),
    };
  }

  static async submit(
    collegeId: string,
    templateId: string,
    data: SubmitTrialInput,
  ): Promise<TrialResult> {
    const paper = await this.loadActiveTrialPaper(collegeId, templateId);
    const template = await TemplateRepository.findById(templateId);
    if (!template) throw new NotFoundError("Assessment template not found");

    const settings = template.settings as {
      negativeMarkingMode?: NegativeMarkingMode;
    };
    const negativeMarkingMode = settings.negativeMarkingMode ?? "none";

    const responseByQuestion = new Map(
      data.answers.map((a) => [a.question_id, a.response]),
    );

    let totalScore = 0;
    let maxScore = 0;
    const sectionScores: Record<string, { score: number; max: number }> = {};
    const perQuestion: TrialResult["perQuestion"] = [];

    for (const pq of paper.paperQuestions) {
      const q = pq.question;
      const marks = Number(q.marks);
      const scorable = q.questionType.autoScorable;

      if (!sectionScores[pq.sectionId]) {
        sectionScores[pq.sectionId] = { score: 0, max: 0 };
      }
      if (scorable) {
        sectionScores[pq.sectionId]!.max += marks;
        maxScore += marks;
      }

      if (!scorable) {
        perQuestion.push({
          questionId: q.id,
          scorable: false,
          autoScore: null,
        });
        continue;
      }

      const response = responseByQuestion.get(q.id) as
        | AnswerResponse
        | undefined;
      const autoScore = scoreAutoAnswer({
        autoScorable: true,
        responseFormat: q.questionType.responseFormat,
        answerKey: q.answerKey as AnswerKey | null,
        response: response ?? null,
        marks,
        negativeMarks: Number(q.negativeMarks),
        negativeMarkingMode,
      });

      const score = autoScore ?? 0;
      totalScore += score;
      sectionScores[pq.sectionId]!.score += score;
      perQuestion.push({ questionId: q.id, scorable: true, autoScore: score });
    }

    return { totalScore, maxScore, sectionScores, perQuestion };
  }
}
