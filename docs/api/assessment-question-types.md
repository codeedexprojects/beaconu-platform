# Assessment Question Types

Reference list of every seeded `AssessmentSection` + `QuestionType` in the `assessments` module (`apps/api/src/modules/assessments/constants/section-seeds/`). Enabling a section for a college auto-seeds its question types (idempotent — see `SectionService.toggleSection`).

## Verbal Communication (core section)

| Name                   | `responseFormat`        | Auto-scorable |
| ---------------------- | ----------------------- | ------------- |
| Audio Comprehension    | `audio_response`        | No            |
| Repeat Sentence        | `audio_response`        | No            |
| Read Aloud             | `audio_response`        | No            |
| Respond to a Situation | `audio_response`        | No            |
| Describe Image         | `audio_response`        | No            |
| Voice Response         | `audio_response`        | No            |
| Voice MCQ              | `voice_mcq`             | No            |
| Voice Dropdown         | `voice_dropdown`        | No            |
| Voice Filling Blank    | `voice_fill_blank`      | No            |
| Voice Incorrect Words  | `voice_incorrect_words` | No            |

## Aptitude & Logical Reasoning (core section)

| Name                             | `responseFormat`       | Auto-scorable |
| -------------------------------- | ---------------------- | ------------- |
| MCQ                              | `single_choice`        | Yes           |
| Data Interpretation              | `single_choice`        | Yes           |
| Sequence Questions               | `sequence`             | Yes           |
| Fill in the Blanks – Drag & Drop | `fill_blank_drag_drop` | Yes           |
| Fill in the Blanks – Drop Down   | `fill_blank_dropdown`  | Yes           |

## Listening & Reading (core section)

| Name                             | `responseFormat`       | Auto-scorable |
| -------------------------------- | ---------------------- | ------------- |
| Audio Comprehension              | `audio_response`       | No            |
| MCQ                              | `single_choice`        | Yes           |
| True/False                       | `single_choice`        | Yes           |
| Passage-Based Questions          | `single_choice`        | Yes           |
| Fill in the Blanks – Drag & Drop | `fill_blank_drag_drop` | Yes           |
| Fill in the Blanks – Drop Down   | `fill_blank_dropdown`  | Yes           |

## Leadership Qualities (core section)

| Name                          | `responseFormat` | Auto-scorable |
| ----------------------------- | ---------------- | ------------- |
| Scenario-Based Writing (Text) | `text_response`  | No            |
| Ranking Questions             | `ranking`        | Yes           |

## Emotional Intelligence (core section)

| Name                  | `responseFormat` | Auto-scorable |
| --------------------- | ---------------- | ------------- |
| Scenario-Based MCQ    | `single_choice`  | Yes           |
| Likert Scale          | `likert_scale`   | No            |
| Situational Judgement | `single_choice`  | Yes           |

## Written Communication (core section)

| Name           | `responseFormat` | Auto-scorable |
| -------------- | ---------------- | ------------- |
| Writing Essay  | `text_response`  | No            |
| Summary        | `text_response`  | No            |
| Email          | `text_response`  | No            |
| Describe Image | `text_response`  | No            |
| Letter Writing | `text_response`  | No            |
| Notice Writing | `text_response`  | No            |
| Dialog Writing | `text_response`  | No            |

## Calculator sections (non-core — course-specific)

| Section               | Question Type                  | `responseFormat` | Auto-scorable |
| --------------------- | ------------------------------ | ---------------- | ------------- |
| Scientific Calculator | Scientific Calculation Problem | `single_choice`  | Yes           |
| Financial Calculator  | Financial Calculation Problem  | `single_choice`  | Yes           |
| Basic Calculator      | Basic Calculation Problem      | `single_choice`  | Yes           |

## All `responseFormat` values

`single_choice`, `multi_choice`\*, `sequence`, `ranking`, `fill_blank_drag_drop`, `fill_blank_dropdown`, `audio_response`, `text_response`, `likert_scale`, `voice_mcq`, `voice_dropdown`, `voice_fill_blank`, `voice_incorrect_words`

\* `multi_choice` isn't assigned to any seeded question type yet, but is supported by the type union (`packages/types/src/assessment.ts`) and the validation logic (`CHOICE_FORMATS` in `question-bank.service.ts`) — usable if a new question type needs it.

## Notes

- Core sections apply globally to every course — questions in them cannot be mapped to specific courses.
- Non-core (calculator) sections are course-specific — every question in them must be mapped to at least one course.
- `responseFormat` drives which answer-input widget the client should render; it's returned per-question on the student attempt endpoints (`AttemptQuestionItem.responseFormat`) alongside `content`.
