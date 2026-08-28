import type { AnswerResponse, QuestionContent } from "@beaconu/types";

export interface QuestionRendererProps {
  content: QuestionContent;
  response: AnswerResponse;
  onChange: (response: AnswerResponse) => void;
}
