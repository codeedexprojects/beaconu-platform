# Assessment Question Types

Canonical, frontend-aligned reference for every seeded `QuestionType` in the `assessments` module (`apps/api/src/modules/assessments/constants/section-seeds/question-type-seeds.ts`). Enabling a section for a college auto-seeds whichever of these types that section references (idempotent — see `SectionService.toggleSection`).

## Design

- `slug` matches the frontend's exact question-type enum values one-for-one (`mcqSingle`, `mcqMultiple`, etc.) — the client can switch on `question_type.slug` directly, no translation table needed.
- `QuestionType.slug` is unique **per college**, not per section — a single canonical type (e.g. `mcqSingle`) is shared across every section that offers it. Sections reference types by slug (`SectionSeedEntry.questionTypeSlugs`); they don't own separate copies.
- `category` is the frontend's **rendering category** (`selection` | `textInput` | `audioListening` | `visualHighlight` | `audioSpeaking` | `visualImage`) — **not** the assessment topic/section. Which topic a question belongs to is tracked by which `AssessmentSection` it's under, independent of this field.
- `answerFormat` is which answer widget the frontend renders (`multiOptionSelection` | `singleOptionSelection` | `slotFillSelection` | `freeText` | `wordHighlightSelection` | `audioRecording`) — coarser than `responseFormat` (e.g. `fill_blank_drag_drop` and `fill_blank_dropdown` both map to `slotFillSelection`).
- `responseFormat` is the internal, more granular format that drives content/answer-key validation in `question-bank.service.ts`.

## The 22 canonical types

| `slug`                  | Name                                   | `category`      | `answerFormat`         | `responseFormat`                  | Auto-scorable |
| ----------------------- | -------------------------------------- | --------------- | ---------------------- | --------------------------------- | ------------- |
| `mcqSingle`             | MCQ (Single Answer)                    | selection       | singleOptionSelection  | `single_choice`                   | Yes           |
| `mcqMultiple`           | MCQ (Multiple Answers)                 | selection       | multiOptionSelection   | `multi_choice`                    | Yes           |
| `dragAndDropFill`       | Fill in the Blanks — Drag & Drop       | selection       | slotFillSelection      | `fill_blank_drag_drop`            | Yes           |
| `dropdownFill`          | Fill in the Blanks — Drop Down         | selection       | slotFillSelection      | `fill_blank_dropdown`             | Yes           |
| `essay`                 | Writing Essay                          | textInput       | freeText               | `text_response`                   | No            |
| `textSummary`           | Summary                                | textInput       | freeText               | `text_response`                   | No            |
| `email`                 | Email                                  | textInput       | freeText               | `text_response`                   | No            |
| `letter`                | Letter Writing                         | textInput       | freeText               | `text_response`                   | No            |
| `notice`                | Notice Writing                         | textInput       | freeText               | `text_response`                   | No            |
| `dialogueCompletion`    | Dialogue Completion                    | textInput       | freeText               | `text_response`                   | No            |
| `summarizeSpokenText`   | Summarize Spoken Text                  | audioListening  | freeText               | `text_response` (hasAudio)        | No            |
| `audioMcqMultiple`      | Audio MCQ (Multiple Answers)           | audioListening  | multiOptionSelection   | `multi_choice` (hasAudio)         | Yes           |
| `audioDropdownFill`     | Audio Fill in the Blanks — Drop Down   | audioListening  | slotFillSelection      | `fill_blank_dropdown` (hasAudio)  | Yes           |
| `audioDragAndDropFill`  | Audio Fill in the Blanks — Drag & Drop | audioListening  | slotFillSelection      | `fill_blank_drag_drop` (hasAudio) | Yes           |
| `audioBestOption`       | Audio Best-Matching Option             | audioListening  | singleOptionSelection  | `single_choice` (hasAudio)        | Yes           |
| `audioMcqSingle`        | Audio MCQ (Single Answer)              | audioListening  | singleOptionSelection  | `single_choice` (hasAudio)        | Yes           |
| `highlightWords`        | Highlight Incorrect Words              | visualHighlight | wordHighlightSelection | `word_highlight`                  | Yes           |
| `audioSpeakingResponse` | Audio Speaking Response                | audioSpeaking   | audioRecording         | `audio_response` (hasAudio)       | No            |
| `repeatSentence`        | Repeat Sentence                        | audioSpeaking   | audioRecording         | `audio_response` (hasAudio)       | No            |
| `readAloud`             | Read Aloud                             | audioSpeaking   | audioRecording         | `audio_response` (hasPassage)     | No            |
| `dataInterpretation`    | Data Interpretation                    | visualImage     | freeText               | `text_response` (hasImage)        | No            |
| `describeImage`         | Describe Image                         | visualImage     | audioRecording         | `audio_response` (hasImage)       | No            |

`audioDropdownFill`/`audioDragAndDropFill`/`audioMcqMultiple`/`audioBestOption`/`audioMcqSingle` are **selection-answered** — the audio is the _prompt_, the student still answers by picking/filling, not by recording. Only `audioSpeakingResponse`/`repeatSentence`/`readAloud`/`describeImage` are actually **voice-recorded** answers (`audioRecording`).

`highlightWords` is validated identically to `mcqMultiple` (`content.options` = the tappable words, `answer_key.correctOptionIds` = which of those word-ids are actually wrong) — same mechanic, different UI widget.

## Section → type mapping

| Section                      | Core?                | Types offered                                                                                                               |
| ---------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Verbal Communication         | Yes                  | `audioSpeakingResponse`, `repeatSentence`, `readAloud`, `describeImage`                                                     |
| Aptitude & Logical Reasoning | Yes                  | `mcqSingle`, `mcqMultiple`, `dragAndDropFill`, `dropdownFill`, `dataInterpretation`                                         |
| Listening & Reading          | Yes                  | `audioMcqSingle`, `audioMcqMultiple`, `audioBestOption`, `audioDragAndDropFill`, `audioDropdownFill`, `summarizeSpokenText` |
| Leadership Qualities         | Yes                  | `mcqSingle`, `essay`, `dialogueCompletion`, `highlightWords`                                                                |
| Emotional Intelligence       | Yes                  | `mcqSingle`, `mcqMultiple`, `essay`, `highlightWords`                                                                       |
| Written Communication        | Yes                  | `essay`, `textSummary`, `email`, `letter`, `notice`, `dialogueCompletion`                                                   |
| Scientific Calculator        | No (course-specific) | `mcqSingle`                                                                                                                 |
| Financial Calculator         | No (course-specific) | `mcqSingle`                                                                                                                 |
| Basic Calculator             | No (course-specific) | `mcqSingle`                                                                                                                 |

## Removed / consolidated (superseded by the above)

These existed in an earlier iteration but aren't part of the frontend's supported set, so they're no longer seeded for new colleges:

- `sequence`/`ranking` responseFormat question types (Sequence Questions, Ranking Questions) — no frontend equivalent.
- Written Communication's text-based "Describe Image" — only the audio version (`describeImage`) is in the frontend's list.
- Emotional Intelligence's "Likert Scale" — no frontend equivalent.
- The original `voice_mcq`/`voice_dropdown`/`voice_fill_blank`/`voice_incorrect_words` types — these assumed voice-_recorded_ answers, but the frontend's audio-listening types are actually selection-answered (see `audioMcqSingle` etc. above); corrected to reuse the plain `single_choice`/`multi_choice`/`fill_blank_*` formats with `hasAudio: true` instead.
- Duplicate/near-duplicate audio types ("Audio Comprehension", "Respond to a Situation", "Voice Response", "True/False", "Passage-Based Questions", per-section "MCQ"/"Scenario-Based MCQ"/"Situational Judgement") — consolidated into the shared canonical types above (e.g. `audioMcqSingle`, `summarizeSpokenText`, `mcqSingle`).
- Per-calculator-section "Scientific/Financial/Basic Calculation Problem" types — consolidated into the shared `mcqSingle` (course-scoping is a property of the `Question`, not the `QuestionType`).

Note: this removal only affects the **seed source** — colleges that already created `Question` rows against these older types keep them in the DB untouched (no destructive migration was run); they just won't be offered as choices for new questions going forward, and the "list question types" endpoint no longer surfaces them.
