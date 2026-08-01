# PATCH /api/v1/student/assessments/attempts/:id/answers/:questionId

Saves (upserts) the student's answer to one question — autosave, call again to overwrite. See [assessment-attempt-question-responses.md](./assessment-attempt-question-responses.md) for how a question is fetched (`GET .../sections/:sectionId/questions`); this doc gives the **exact full request body** to submit for every one of the 22 seeded question types — one per section, matching the same example question ids used in that doc so the two line up 1:1.

## Endpoint shape

```
PATCH /api/v1/student/assessments/attempts/{{assessmentAttemptId}}/answers/{{questionId}}
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

- `{{questionId}}` is the `question.questionId` from the GET question response (**not** `question.id`, which is the paper-question row id).
- `response`, `is_flagged`, `time_spent_secs` are all individually optional, but **at least one must be present** — omitting all three → `ValidationError`.
- Send **only** the `response` sub-field(s) that match that question's own `response_format` — nothing extra.
- Requires the attempt to be `"in_progress"` — `ConflictError` otherwise.

Response envelope (same shape for every type):

```json
{
  "success": true,
  "message": "Answer saved",
  "data": {
    "id": "ANS-100",
    "attemptId": "ATT-5",
    "questionId": "QST-23",
    "sectionId": "SEC-2",
    "response": { "...": "echoes back what you sent" },
    "isFlagged": false,
    "timeSpentSecs": 32,
    "autoScore": 5,
    "manualScore": null,
    "finalScore": 5,
    "evaluationStatus": "auto_scored",
    "evaluationRemarks": null,
    "answeredAt": "2026-07-31T12:05:00.000Z"
  },
  "timestamp": "2026-07-31T12:05:00.000Z"
}
```

`evaluationStatus` is `"auto_scored"` for auto-scorable types (score computed immediately) or `"pending"` for the rest (evaluator scores it later) — noted per type below.

---

## Verbal Communication section

### audioSpeakingResponse — `audio_response`, evaluator-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-40
```

```json
{
  "response": {
    "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/student/STU-12/assessments/qst-40-recording.mp3"
  },
  "is_flagged": false,
  "time_spent_secs": 45
}
```

### repeatSentence — `audio_response`, evaluator-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-41
```

```json
{
  "response": {
    "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/student/STU-12/assessments/qst-41-recording.mp3"
  },
  "time_spent_secs": 20
}
```

### readAloud — `audio_response`, evaluator-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-42
```

```json
{
  "response": {
    "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/student/STU-12/assessments/qst-42-recording.mp3"
  },
  "time_spent_secs": 30
}
```

### describeImage — `audio_response`, evaluator-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-44
```

```json
{
  "response": {
    "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/student/STU-12/assessments/qst-44-recording.mp3"
  },
  "is_flagged": false,
  "time_spent_secs": 40
}
```

**Audio upload flow, required before every `audio_response` submission above:**

1. `POST /student/uploads/audio/presign` → get `uploadUrl`
2. `PUT` the recorded audio blob to `uploadUrl`
3. `POST /student/uploads/audio/verify` → get back `permanentUrl`
4. Use `permanentUrl` as `response.audioUrl` in the PATCH above

`content.audioUrl` (on the GET question response) is the question's own _prompt_ audio — a different field from `response.audioUrl`, which is the student's own recorded answer.

---

## Aptitude & Logical Reasoning section

### mcqSingle — `single_choice`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-23
```

```json
{
  "response": { "selectedOptionIds": ["o2"] },
  "is_flagged": false,
  "time_spent_secs": 18
}
```

### mcqMultiple — `multi_choice`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-24
```

```json
{
  "response": { "selectedOptionIds": ["o2", "o3"] },
  "time_spent_secs": 25
}
```

### dragAndDropFill — `fill_blank_drag_drop`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-25
```

```json
{
  "response": {
    "blankAnswers": [
      { "blankId": "b1", "optionId": "w1" },
      { "blankId": "b2", "optionId": "w2" }
    ]
  },
  "time_spent_secs": 35
}
```

### dropdownFill — `fill_blank_dropdown`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-26
```

```json
{
  "response": {
    "blankAnswers": [
      { "blankId": "b1", "optionId": "d1" },
      { "blankId": "b2", "optionId": "d2" }
    ]
  },
  "time_spent_secs": 22
}
```

### dataInterpretation — `text_response`, evaluator-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-43
```

```json
{
  "response": {
    "text": "Q3 shows the highest growth (18% QoQ), driven by the new product launch and seasonal demand."
  },
  "time_spent_secs": 90
}
```

---

## Written Communication section

All six types below share `text_response` / `freeText` — same shape, evaluator-scored, only the question and expected answer length differ.

### essay

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-27
```

```json
{
  "response": {
    "text": "Time management is a critical skill that determines both academic and professional success. By prioritizing tasks..."
  },
  "time_spent_secs": 600
}
```

### textSummary

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-28
```

```json
{
  "response": {
    "text": "Renewable energy is now cost-competitive with fossil fuels, driven by falling solar and wind production costs."
  },
  "time_spent_secs": 180
}
```

### email

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-29
```

```json
{
  "response": {
    "text": "Dear Professor Smith,\n\nI am writing to request a short extension on the assignment due..."
  },
  "time_spent_secs": 240
}
```

### letter

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-30
```

```json
{
  "response": {
    "text": "Dear Editor,\n\nI am writing to raise concern over the worsening traffic congestion in our city..."
  },
  "time_spent_secs": 300
}
```

### notice

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-31
```

```json
{
  "response": {
    "text": "NOTICE\n\nAll students are informed that the Annual Sports Day will be held on..."
  },
  "time_spent_secs": 150
}
```

### dialogueCompletion

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-32
```

```json
{
  "response": {
    "text": "Sure! Go straight down this road, then take a left at the second signal — the library is right there."
  },
  "time_spent_secs": 60
}
```

---

## Listening & Reading section

### summarizeSpokenText — `text_response`, evaluator-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-33
```

```json
{
  "response": {
    "text": "The speaker explains that the quarterly meeting has been moved to next Friday due to a venue conflict."
  },
  "time_spent_secs": 120
}
```

### audioMcqMultiple — `multi_choice`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-34
```

```json
{
  "response": { "selectedOptionIds": ["a1", "a2"] },
  "time_spent_secs": 40
}
```

### audioDropdownFill — `fill_blank_dropdown`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-35
```

```json
{
  "response": {
    "blankAnswers": [
      { "blankId": "b1", "optionId": "t1" },
      { "blankId": "b2", "optionId": "t2" }
    ]
  },
  "time_spent_secs": 35
}
```

### audioDragAndDropFill — `fill_blank_drag_drop`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-36
```

```json
{
  "response": {
    "blankAnswers": [
      { "blankId": "b1", "optionId": "w1" },
      { "blankId": "b2", "optionId": "w2" }
    ]
  },
  "time_spent_secs": 38
}
```

### audioBestOption — `single_choice`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-37
```

```json
{
  "response": { "selectedOptionIds": ["o1"] },
  "time_spent_secs": 28
}
```

### audioMcqSingle — `single_choice`, auto-scored

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-38
```

```json
{
  "response": { "selectedOptionIds": ["trueopt"] },
  "time_spent_secs": 20
}
```

---

## Leadership Qualities section

### highlightWords — `word_highlight`, auto-scored

Structurally identical to `multi_choice` — `content.options` are the tappable words, the student selects the ones they think are wrong.

```
PATCH /assessments/attempts/{{assessmentAttemptId}}/answers/QST-39
```

```json
{
  "response": { "selectedOptionIds": ["w2"] },
  "is_flagged": false,
  "time_spent_secs": 15
}
```

---

## `ranking` / `sequence` — not currently seeded, but supported

No question type in the current 22-type registry uses these formats yet, but the endpoint already supports them end-to-end (ordering/ranking UI) — included here so the frontend has the shape ready:

```json
{
  "response": { "order": ["opt-3", "opt-1", "opt-2"] },
  "time_spent_secs": 30
}
```

Full ordered list of option ids — auto-scored, must exactly match `answer_key.correctOrder` position-for-position.

---

## Flag-only / time-only saves (no answer given yet)

Valid without any `response` — e.g. marking a question "for review" while skipping it, or just recording time spent on navigation:

```json
{ "is_flagged": true }
```

```json
{ "time_spent_secs": 15 }
```

Upserts an answer row with `response: null`, `evaluationStatus: "pending"` — safe to call repeatedly.

---

## Quick reference table

| Question type slug      | Section                      | `response_format`      | `response` field to send              | Scored    |
| ----------------------- | ---------------------------- | ---------------------- | ------------------------------------- | --------- |
| `mcqSingle`             | Aptitude & Logical Reasoning | `single_choice`        | `selectedOptionIds: [id]`             | Auto      |
| `mcqMultiple`           | Aptitude & Logical Reasoning | `multi_choice`         | `selectedOptionIds: [id, ...]`        | Auto      |
| `dragAndDropFill`       | Aptitude & Logical Reasoning | `fill_blank_drag_drop` | `blankAnswers: [{blankId, optionId}]` | Auto      |
| `dropdownFill`          | Aptitude & Logical Reasoning | `fill_blank_dropdown`  | `blankAnswers: [{blankId, optionId}]` | Auto      |
| `dataInterpretation`    | Aptitude & Logical Reasoning | `text_response`        | `text: string`                        | Evaluator |
| `essay`                 | Written Communication        | `text_response`        | `text: string`                        | Evaluator |
| `textSummary`           | Written Communication        | `text_response`        | `text: string`                        | Evaluator |
| `email`                 | Written Communication        | `text_response`        | `text: string`                        | Evaluator |
| `letter`                | Written Communication        | `text_response`        | `text: string`                        | Evaluator |
| `notice`                | Written Communication        | `text_response`        | `text: string`                        | Evaluator |
| `dialogueCompletion`    | Written Communication        | `text_response`        | `text: string`                        | Evaluator |
| `summarizeSpokenText`   | Listening & Reading          | `text_response`        | `text: string`                        | Evaluator |
| `audioMcqMultiple`      | Listening & Reading          | `multi_choice`         | `selectedOptionIds: [id, ...]`        | Auto      |
| `audioDropdownFill`     | Listening & Reading          | `fill_blank_dropdown`  | `blankAnswers: [{blankId, optionId}]` | Auto      |
| `audioDragAndDropFill`  | Listening & Reading          | `fill_blank_drag_drop` | `blankAnswers: [{blankId, optionId}]` | Auto      |
| `audioBestOption`       | Listening & Reading          | `single_choice`        | `selectedOptionIds: [id]`             | Auto      |
| `audioMcqSingle`        | Listening & Reading          | `single_choice`        | `selectedOptionIds: [id]`             | Auto      |
| `highlightWords`        | Leadership Qualities         | `word_highlight`       | `selectedOptionIds: [id, ...]`        | Auto      |
| `audioSpeakingResponse` | Verbal Communication         | `audio_response`       | `audioUrl: string`                    | Evaluator |
| `repeatSentence`        | Verbal Communication         | `audio_response`       | `audioUrl: string`                    | Evaluator |
| `readAloud`             | Verbal Communication         | `audio_response`       | `audioUrl: string`                    | Evaluator |
| `describeImage`         | Verbal Communication         | `audio_response`       | `audioUrl: string`                    | Evaluator |
| _(unseeded)_            | —                            | `ranking` / `sequence` | `order: [id, id, ...]`                | Auto      |

This same `response` shape (minus `is_flagged`/`time_spent_secs`, wrapped with a `question_id` field instead of it being in the URL) is reused as-is by `POST /assessments/templates/:templateId/trial/submit` — see the `submit-trial.bru` contract.
