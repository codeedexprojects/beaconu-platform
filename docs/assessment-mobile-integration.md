# Admission Assessment — Mobile Integration Guide

Handoff doc for the mobile team. It covers the online assessment a student takes after submitting an application: finding out it is due, the practice trial, the real timed attempt, answering every question type, anti-cheat, submission and results.

The backend is built and the college web portal (`apps/college-web`) already runs this flow, so behaviour described here is what students see on the web today. Where the web portal does something the API doesn't enforce, this doc says so.

All endpoints are under `/api/v1/student/*` and need the student JWT (`Authorization: Bearer <token>`). Standard envelope:

```json
{ "success": true, "message": "...", "data": ..., "timestamp": "..." }
{ "success": false, "message": "...", "error": { "code": "CONFLICT", "details": [] }, "timestamp": "..." }
```

IDs are strings like `APP-12`, `AAT-4`, `ASC-3`, `QST-88`. Treat them as opaque.

---

## ⚠️ Read this first

**1. Backgrounding the app terminates the attempt.** When the app goes to background you must report `tab_hidden`. If no `tab_visible` follows within 10 seconds, a server job (runs every minute) sets the attempt to `terminated` — final, no retry. A phone call, notification shade, or app switcher counts. Warn the student on the instructions screen, and send `tab_visible` the moment the app is foregrounded.

**2. The server only enforces the total time.** Total allowed time = sum of section time limits + a 5-minute buffer, and never past the slot's `windowEnd`. After that the job auto-submits (`auto_submitted`). Section `timeLimitMins` and question `timeLimitSecs` are not enforced anywhere; the web portal shows one countdown for the whole attempt and lets students move freely between sections. Match that.

**3. There is exactly one attempt per application.** `POST /attempts` returns 409 if one exists. Only college staff can reset it. Never call start twice; always check `myAttempt` first.

**4. Save every answer as soon as it changes.** Nothing is sent on submit except the submit call itself. An answer not saved before submit/auto-submit is lost, and unanswered auto-scored questions count as wrong.

**5. `responseFormat` decides the UI, not the question type name.** Several types share a format (an essay and a data-interpretation question are both `text_response`). Render by `responseFormat` + the fields present in `content` — see §4.

**6. Results are totals only.** The student sees `totalScore` / `maxScore` once college staff finish evaluating. There is no per-question review endpoint.

---

## 1. Flow at a glance

```
Application submitted (formStatus = "submitted") and the cycle requires an assessment
        │
        ▼
GET  /application-forms/:cycleId/application/status   → assessment.status
        │  "not_started"
        ▼
GET  /assessments/start?application_id=                 → template, slot window, myAttempt, trial available?
        │
        ├── optional practice ─► GET /assessments/templates/:templateId/trial/sections
        │                        GET /assessments/templates/:templateId/trial/sections/:sectionId/questions?question_order=
        │
        ▼  (inside window, no attempt yet)
POST /assessments/attempts                              → attempt { id, status: "in_progress", startedAt }
        │
        ▼  loop per section
GET  /assessments/attempts/:id/sections                 → sections with answered counts
GET  /assessments/attempts/:id/sections/:sectionId/questions?question_order=N
PATCH /assessments/attempts/:id/answers/:questionId     → save / flag / time spent
GET  /assessments/attempts/:id/overview?section_id=     → palette: answered / flagged per question
POST /assessments/attempts/:id/anti-cheat-events        → on background / foreground
        │
        ▼
POST /assessments/attempts/:id/submit                   → status "under_evaluation"
        │
        ▼  (later, after staff evaluation)
GET  /application-forms/:cycleId/application/status   → assessment.status "result_published", totalScore, maxScore
```

### Attempt statuses

| Status             | Meaning                                  | Show                          |
| ------------------ | ---------------------------------------- | ----------------------------- |
| `in_progress`      | Started, not finished                    | Resume the test               |
| `completed`        | Submitted by the student (momentary)     | Treat as submitted            |
| `auto_submitted`   | Time or window ran out (momentary)       | Treat as submitted            |
| `terminated`       | Left the app for >10 s (momentary)       | Treat as submitted            |
| `under_evaluation` | Final state after any of the three above | "Submitted — results pending" |
| `evaluated`        | Scored (momentary)                       | —                             |
| `result_published` | Score available                          | Show score                    |

`completed`, `auto_submitted` and `terminated` flip to `under_evaluation` immediately, so the app will almost always see `under_evaluation`. The original reason is not exposed to the student.

---

## 2. Endpoints

### 2.1 Is an assessment due? — application status

`GET /api/v1/student/application-forms/:admissionCycleId/application/status?application_id=APP-12`

Relevant slice of `data`:

```json
{
  "application": {
    "applicationId": "APP-12",
    "formStatus": "submitted",
    "...": "..."
  },
  "assessment": {
    "status": "not_started",
    "attemptId": null,
    "startedAt": null,
    "completedAt": null,
    "totalScore": null,
    "maxScore": null
  }
}
```

`assessment.status`: `not_required` | `not_started` | any attempt status from §1.

- `not_required` → hide the assessment step.
- `not_started` and `formStatus === "submitted"` → show "Take assessment", open §2.2.
- `in_progress` → "Resume assessment", jump to §2.4 with `attemptId`.
- `under_evaluation` → "Submitted, results pending".
- `result_published` → show `totalScore / maxScore`.

### 2.2 Start screen info

`GET /api/v1/student/assessments/start?application_id=APP-12`

```json
{
  "slot": {
    "id": "ASL-3",
    "slotType": "window",
    "windowStart": "2026-09-20T03:30:00.000Z",
    "windowEnd": "2026-09-22T12:30:00.000Z",
    "status": "active"
  },
  "template": {
    "id": "AST-2",
    "name": "UG Aptitude & Communication",
    "totalQuestions": 40,
    "totalMarks": 50,
    "totalDurationMins": 65,
    "negativeMarkingMode": "none",
    "instructions": [
      {
        "heading": "Stay in the app",
        "description": "Leaving the app ends your test.",
        "icon": "shield"
      }
    ],
    "sections": [
      {
        "id": "ASC-1",
        "name": "Aptitude & Logical Reasoning",
        "description": "...",
        "questionCount": 20,
        "timeLimitMins": 30
      },
      {
        "id": "ASC-4",
        "name": "Written Communication",
        "description": null,
        "questionCount": 20,
        "timeLimitMins": 30
      }
    ]
  },
  "isWithinWindow": true,
  "hasWindowPassed": false,
  "hasActiveTrialPaper": true,
  "myAttempt": null
}
```

- `template.sections[].id` is the **section id** used in every later URL.
- `totalDurationMins` includes the 5-minute buffer.
- `negativeMarkingMode`: `none` | `fixed` | `proportional`. When not `none`, tell the student wrong answers lose marks and skipping is safer.
- `slot` is `null` when the college hasn't scheduled one → "Not scheduled yet".
- `myAttempt: { id, status }` when an attempt exists → go straight to resume / submitted state; never show Start.

Errors: 404 application not found / not yours · 409 "No assessment configured for this admission cycle".

**Start button rules:** show Start only when `myAttempt === null && isWithinWindow`. Before the window, show a countdown to `windowStart`; when `hasWindowPassed`, show "Window closed". The API also refuses to start outside the window (§2.4), so this is a UX guard, not the only protection.

`slot` is the window the student would sit now: the one currently open, else the next one opening, else the most recent past one.

### 2.3 Practice trial (optional)

Only when `hasActiveTrialPaper` is true. Nothing is saved or scored; use it so students learn the UI. Same response shapes as the real attempt, so the same screens render both.

`GET /api/v1/student/assessments/templates/:templateId/trial/sections` → same array as §2.5, with `answeredCount: 0` and `status: "not_started"`.

`GET /api/v1/student/assessments/templates/:templateId/trial/sections/:sectionId/questions?question_order=1` → same page as §2.6, `myAnswer` always `null`.

Keep trial answers in local state only; do not call save/submit endpoints. 404 when there is no active trial paper.

> The web portal calls `/templates/:id/trial` and `/trial/submit` — those routes do not exist. Don't copy them.

### 2.4 Start the attempt

`POST /api/v1/student/assessments/attempts`

```json
{ "application_id": "APP-12" }
```

`201`:

```json
{
  "id": "AAT-4",
  "applicationId": "APP-12",
  "studentId": "STU-7",
  "paperId": "ASP-9",
  "slotId": "ASL-3",
  "status": "in_progress",
  "startedAt": "2026-09-21T05:02:11.000Z",
  "completedAt": null,
  "lastActivityAt": "2026-09-21T05:02:11.000Z",
  "antiCheatLog": [],
  "...": "..."
}
```

Store `id` and `startedAt` — the countdown is computed from `startedAt` (§5.1), never from the moment the screen opened.

Errors (409 unless noted): application not at assessment stage (`formStatus` not submitted) · assessment not required · no assessment configured · no slot scheduled · "The assessment window hasn't opened yet…" · "The assessment window has closed…" · no approved paper yet · "You already have an attempt for this application" · 404 application not found.

Show the window messages as-is; they tell the student what to do. Never retry a start that failed this way.

Get an existing attempt: `GET /api/v1/student/assessments/attempts/:id` → same object (use on resume to read `status` and `startedAt`).

### 2.5 Sections of the attempt

`GET /api/v1/student/assessments/attempts/:id/sections`

```json
[
  {
    "id": "TPS-11",
    "sectionId": "ASC-1",
    "name": "Aptitude & Logical Reasoning",
    "description": "...",
    "isCoreSection": true,
    "questionCount": 20,
    "timeLimitMins": 30,
    "answeredCount": 7,
    "status": "in_progress"
  }
]
```

Use `sectionId` in URLs (not `id`). `status`: `not_started` | `in_progress` | `completed` (all answered).

### 2.6 One question

`GET /api/v1/student/assessments/attempts/:id/sections/:sectionId/questions?question_order=1`

`question_order` is 1-based within the section.

```json
{
  "question": {
    "id": "PQS-301",
    "questionId": "QST-88",
    "questionOrder": 1,
    "questionTypeId": "QTP-1",
    "questionTypeName": "MCQ (Single Answer)",
    "responseFormat": "single_choice",
    "content": {
      "text": "If 3x + 5 = 20, what is x?",
      "options": [
        { "id": "a", "text": "3" },
        { "id": "b", "text": "5" },
        { "id": "c", "text": "7" }
      ]
    },
    "marks": 1,
    "timeLimitSecs": 60,
    "myAnswer": {
      "response": { "selectedOptionIds": ["b"] },
      "isFlagged": false,
      "answeredAt": "2026-09-21T05:04:40.000Z"
    }
  },
  "questionOrder": 1,
  "totalQuestions": 20,
  "hasNext": true,
  "hasPrevious": false
}
```

- **Use `question.questionId` when saving**, not `question.id`.
- `myAnswer` is `null` until something was saved; restore UI state from it on resume.
- The answer key is never sent.
- 404 when `question_order` is out of range.

### 2.7 Save an answer / flag / time spent

`PATCH /api/v1/student/assessments/attempts/:id/answers/:questionId`

```json
{
  "response": { "selectedOptionIds": ["b"] },
  "is_flagged": false,
  "time_spent_secs": 42
}
```

All three optional, at least one required. Send only what changed:

- Flag toggle: `{ "is_flagged": true }` (keeps the saved response).
- Clear an answer: send the empty shape for that format, e.g. `{ "response": { "selectedOptionIds": [] } }`.
- `time_spent_secs` **replaces** the stored value — send the cumulative seconds on that question, not a delta.

`response` shapes per format are in §4. Returns the updated attempt row (ignore the body; treat 200 as saved).

Errors: 409 "This attempt is not in progress" (it was submitted, auto-submitted or terminated — stop and route to the submitted screen) · 404 question not on this paper · 400 validation.

### 2.8 Question palette / section overview

`GET /api/v1/student/assessments/attempts/:id/overview?section_id=ASC-1`

```json
{
  "sectionId": "ASC-1",
  "sectionName": "Aptitude & Logical Reasoning",
  "totalQuestions": 20,
  "answeredCount": 7,
  "flaggedCount": 2,
  "questions": [
    {
      "questionOrder": 1,
      "questionId": "QST-88",
      "isAnswered": true,
      "isFlagged": false
    },
    {
      "questionOrder": 2,
      "questionId": "QST-91",
      "isAnswered": false,
      "isFlagged": true
    }
  ]
}
```

Drives the numbered palette and the "review before submit" screen.

### 2.9 Anti-cheat events

`POST /api/v1/student/assessments/attempts/:id/anti-cheat-events`

```json
{ "type": "tab_hidden" }
```

`type`: `tab_hidden` | `tab_visible`. Returns the attempt. 409 if no longer in progress.

| App lifecycle                                                | Send          |
| ------------------------------------------------------------ | ------------- |
| Flutter `AppLifecycleState.paused` / `inactive` → background | `tab_hidden`  |
| `resumed`                                                    | `tab_visible` |

Only the **last** event matters: `tab_hidden` older than 10 s at the next sweep = terminated. On `resumed`, send `tab_visible` before anything else, then re-fetch the attempt — if it's no longer `in_progress`, show the submitted screen.

### 2.10 Submit

`POST /api/v1/student/assessments/attempts/:id/submit` (no body)

Returns the attempt with `status: "under_evaluation"`, `completedAt`, `timeSpentSecs`. 409 if already not in progress — treat as already submitted.

Flush any unsaved answer and wait for its PATCH to finish before calling submit.

### 2.11 Audio answers — upload

For `audio_response` questions the answer is a URL to an uploaded recording.

1. `POST /api/v1/student/uploads/audio/presign`
   ```json
   { "mimeType": "audio/mp4", "fileSizeBytes": 183422 }
   ```
   → `{ "uploadUrl": "https://s3...", "key": "student/STU-7/audio/....m4a", "expiresIn": 300 }` (upload within 5 minutes)
2. `PUT uploadUrl` with the raw file, header `Content-Type` = the same `mimeType`.
3. `POST /api/v1/student/uploads/audio/verify` with `{ "key": "..." }`
   → `{ "verified": true, "permanentUrl": "https://...", "viewUrl": "https://..." }`
4. Save the answer: `{ "response": { "audioUrl": "<permanentUrl>" } }`.

Allowed `mimeType`: `audio/mp4` (m4a/AAC — native on both platforms, recommended), `audio/mpeg`, `audio/wav`. Max 10 MB.

---

## 3. Results

After submit there is nothing to poll on the assessment API. College staff evaluate (text and audio answers are marked by hand), which sets the attempt to `result_published`. Read it from the application status (§2.1):

```json
"assessment": {
  "status": "result_published",
  "attemptId": "AAT-4",
  "startedAt": "2026-09-21T05:02:11.000Z",
  "completedAt": "2026-09-21T06:01:40.000Z",
  "totalScore": 38.5,
  "maxScore": 50
}
```

If every section has a weightage, `maxScore` is `100` and `totalScore` is weighted. There is no push notification for results today — refresh status on app open / pull-to-refresh.

---

## 4. Question types — rendering and answer shapes

`content` fields (all optional): `text`, `question`, `audioUrl`, `imageUrl`, `options[] { id, text }`, `blanks[] { id, label?, imageUrl? }`, `promptType` (`text` | `audio`).

Always render, when present: `imageUrl` (image above the question), `audioUrl` (play control; this is the prompt audio, not the answer), `text` (passage/prompt), `question` (the actual question line).

| `responseFormat`       | Seeded types                                                                                           | UI                                                                            | `response` to save                                            | Scored   |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------- | -------- |
| `single_choice`        | MCQ single, Audio MCQ single, Audio best option                                                        | Radio list of `options`                                                       | `{ "selectedOptionIds": ["b"] }`                              | Auto     |
| `multi_choice`         | MCQ multiple, Audio MCQ multiple                                                                       | Checkbox list                                                                 | `{ "selectedOptionIds": ["a","c"] }` (order ignored)          | Auto     |
| `fill_blank_dropdown`  | Dropdown fill, Audio dropdown fill                                                                     | See blanks below, dropdown per blank                                          | `{ "blankAnswers": [{ "blankId": "b1", "optionId": "o3" }] }` | Auto     |
| `fill_blank_drag_drop` | Drag & drop fill, Audio drag & drop fill                                                               | Blanks + draggable option chips (a tap-to-place fallback is fine)             | same as above                                                 | Auto     |
| `matching`             | Match the following                                                                                    | Each `blank` (left item, `label`/`imageUrl`) gets an `options` choice         | same as above                                                 | Auto     |
| `word_highlight`       | Highlight incorrect words                                                                              | `options` are the words of the passage in order; render inline, tap to toggle | `{ "selectedOptionIds": ["w4","w9"] }`                        | See §6.3 |
| `ranking`, `sequence`  | —                                                                                                      | Reorderable list of `options`                                                 | `{ "order": ["c","a","b"] }` (full order)                     | Auto     |
| `text_response`        | Essay, Summary, Email, Letter, Notice, Dialogue completion, Summarize spoken text, Data interpretation | Multiline text box                                                            | `{ "text": "..." }`                                           | Manual   |
| `audio_response`       | Speaking response, Repeat sentence, Read aloud, Describe image                                         | Record / stop / re-record / play back, then upload (§2.11)                    | `{ "audioUrl": "https://..." }`                               | Manual   |

**Blanks with inline tokens.** For `fill_blank_dropdown` / `fill_blank_drag_drop`, if `content.text` contains `[[blank]]` tokens, render the passage with the blanks inline: the Nth `[[blank]]` maps to `content.blanks[N-1]`. Otherwise render a list: one row per blank (`label`), each with a picker over `content.options`.

**Dialogue completion** is a `text_response` whose `content.text` has turns like `A: ...\nB: ...`. Render it as a chat transcript with a text box for the last (blank) turn; still save `{ "text": "..." }`.

**Unknown `responseFormat`** (e.g. `likert_scale`, `voice_*` reserved names): fall back by content — blanks → blank UI; options → checkbox list; otherwise text box. Log it so backend can add a mapping.

Auto-scored questions are scored the moment they're saved. Unanswered auto-scored questions become wrong at submit. With negative marking on, a wrong saved answer loses marks but an unanswered one doesn't.

---

## 5. Frontend implementation plan

### 5.1 Screens

| #   | Screen                  | Data             | Notes                                                                                                                                                                                        |
| --- | ----------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Application status card | §2.1             | Entry point; label by `assessment.status`                                                                                                                                                    |
| 2   | Assessment intro        | §2.2             | Name, sections table (questions, minutes), total marks, duration, negative marking, `instructions[]`, window dates. Buttons: "Try practice test" (if trial), "Start assessment" (§2.2 rules) |
| 3   | Pre-start checklist     | local            | Stay in the app, notifications/DND, battery, network, mic permission if any section needs audio. Confirm dialog: one attempt only                                                            |
| 4   | Section list            | §2.5             | Status chips, answered counts; any section can be opened                                                                                                                                     |
| 5   | Question runner         | §2.6, §2.7       | Header: section name, "Q 3/20", total countdown. Body: renderer by §4. Footer: Previous / Flag / Next (Next on the last question moves to the next section), palette button                  |
| 6   | Palette sheet           | §2.8             | Grid of question numbers: answered / flagged / not visited                                                                                                                                   |
| 7   | Review & submit         | §2.8 per section | Unanswered + flagged counts, "Submit" confirm                                                                                                                                                |
| 8   | Submitted               | —                | "Results will appear in your application status"                                                                                                                                             |
| 9   | Practice runner         | §2.3             | Same as 4–7 with local-only answers; ends with "Practice finished"                                                                                                                           |

### 5.2 State and saving

- One `AttemptSession` object: `attemptId`, `startedAt`, `serverOffset` (see 5.4), current `sectionId`, `questionOrder`, per-question local drafts, per-question time spent.
- **Save on change**, debounced ~800 ms for text; immediately for taps. Keep a small outbox queue (question id → latest body) so a failed save retries and newer edits overwrite older queued ones.
- Show a subtle saved / saving / offline indicator. Block Submit while the outbox isn't empty (with a "retry" option).
- On every 409 from save/anti-cheat/submit: stop timers, clear the outbox, show Submitted.

### 5.3 Timers

- **One countdown for the whole attempt**, like the web portal. Student-facing end time = `min(startedAt + Σ section timeLimitMins, slot.windowEnd)`. The server allows 5 more minutes (`totalDurationMins` from §2.2 includes that buffer) — keep it as slack for slow networks, don't show it.
- At zero: flush the outbox and call submit. (The web portal only shows the countdown and leaves submission to the server; submitting from the app gives the student a clean ending instead of a 409 later.)
- **Always derive remaining time from `startedAt` and server time**, never from when the screen opened. The web portal restarts its countdown from full on page reload — don't copy that.
- Section `timeLimitMins` and question `timeLimitSecs`: display only (e.g. "~30 min" on the section card). No per-section or per-question countdowns, so web and app behave the same.

### 5.4 Resume

On app start or reopening the assessment:

1. `GET /assessments/start` → if `myAttempt.status === "in_progress"`, continue.
2. `GET /attempts/:id` → `startedAt`; compute remaining from server time. Use the `Date` response header to estimate `serverOffset` so a wrong device clock can't extend or shrink the timer.
3. `GET /attempts/:id/sections` → first section not `completed`.
4. `GET .../questions?question_order=` for the first unanswered question (use §2.8 to find it).
5. If remaining ≤ 0, call submit and show Submitted.

### 5.5 Anti-cheat on mobile

- Send `tab_hidden` on background, `tab_visible` on resume (§2.9). Fire-and-forget with one retry; don't block the UI.
- Enable a "keep screen on" wake lock during the attempt.
- Optional hardening (not required by the API): Android `FLAG_SECURE` to block screenshots/recording; iOS screen-capture detection with a warning.
- Clearly warn on the checklist screen that calls/notifications that background the app end the test.

### 5.6 Audio

- Request mic permission on the checklist screen if any question in the paper is `audio_response` (you only know per question, so request at the first audio question if you prefer, but not mid-timer if avoidable).
- Record as AAC `.m4a` (`audio/mp4`), mono, 16–44.1 kHz. Keep under 10 MB.
- Upload immediately after stop (§2.11), then save. Show "uploading"; don't let Next discard an in-flight upload — queue it.
- Prompt `content.audioUrl` playback: follow the web portal — allow play/pause; don't add seek-back if the college wants single play (confirm with product).

### 5.7 Offline and errors

| Situation                           | Behaviour                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Network drops mid-test              | Timers keep running; answers go to the outbox; banner "Reconnecting…"      |
| Save 400                            | Bug in the response shape — log with `responseFormat`, don't loop          |
| Save/submit 409                     | Attempt ended server-side → Submitted screen                               |
| Start 409 "already have an attempt" | Re-fetch §2.2 and resume                                                   |
| 401                                 | Token expired: refresh and retry the queued request; don't lose the outbox |

### 5.8 Test checklist

1. Window not open → Start hidden, countdown shown; window passed → closed state.
2. Start → kill the app → reopen → resumes same question with answers restored and correct remaining time.
3. Background the app 5 s → back → attempt continues. 15 s → attempt ends within ~1 minute (Submitted on resume).
4. Every format in §4 saves and restores via `myAnswer`.
5. Flag / unflag keeps the saved answer.
6. Kill and reopen the app mid-test → countdown continues from `startedAt`, not from full.
7. Total time runs out while offline → on reconnect, submit returns 409 or success, app shows Submitted either way.
8. Audio: record, re-record, upload over slow network, then Next.
9. Practice trial never calls save/submit.
10. After staff evaluation, status shows `result_published` with score.

---

## 6. Backend notes (known gaps)

1. ~~Start doesn't check the slot window.~~ Fixed: `POST /attempts` now rejects a start before or after the window with a 409, so an attempt can no longer be created and then auto-submitted minutes later, burning the student's single attempt. Slot selection also prefers the currently open window over the newest one.
2. **Web trial calls hit missing routes.** College-web calls `GET /templates/:id/trial` and `POST /templates/:id/trial/submit`; only the `trial/sections` routes exist.
3. **`word_highlight` is marked auto-scorable but the scorer has no rule for it**, so those answers always score 0 (or negative, with negative marking). Needs a backend fix before colleges use that question type.
4. **Section and question time limits are not enforced anywhere** — not by the API, not by the web portal. Only total duration and window are server-enforced. If colleges expect per-section timing, that needs a product decision and backend work.
5. **Web countdown resets on reload** (college-web `use-question-timer.ts` starts from the full duration instead of `startedAt`), so web students see more time than they have after a refresh.
6. **No results notification** — the student must refresh status.
7. **Bruno contracts** for these student assessment endpoints are not in `packages/api-contracts/` yet; this doc is the reference.
