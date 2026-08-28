# Interview Booking Integration

**BeaconU · college-web · Planning Document**

Full API inventory for student-facing interview booking, plus a phased implementation
plan for consuming it in the student application flow. No backend changes required —
this covers frontend work only. Backend module is fully built (`apps/api/src/modules/interviews/`),
and college-admin already has a complete working frontend for the admin side.

- Backend — fully implemented
- Frontend (student side) — not started; only a disabled placeholder button exists
- Target: `apps/college-web`

---

## Contents

1. [Where this fits in the pipeline](#1-where-this-fits-in-the-pipeline)
2. [Booking eligibility rules](#2-booking-eligibility-rules)
3. [API inventory](#3-api-inventory)
4. [Shared types](#4-shared-types)
5. [Implementation plan](#5-frontend-implementation-plan)
6. [Open questions](#6-open-questions-before-building)

---

## 1. Where this fits in the pipeline

Confirmed order (both from the enum in `packages/types/src/enums.ts` and `apps/api/CLAUDE.md`'s
documented status flow):

```
submitted → under_review → eligibility_check → assessment_pending
   → assessment_completed → interview_pending → interview_completed
   → shortlisted → offer_issued → token_paid → enrolled
```

**Interview happens before shortlisting, not after.** The status timeline already reflects
this correctly: "Attend Interview" is gated on the assessment being done, and "Application
Shortlisted" is gated on the interview being done — shortlisting is a separate, later admin
action (`OfferLetterService.issueForShortlist`), not an automatic side effect of interview
completion.

The `application-status-timeline.tsx` component already reads `interview` from
`ApplicationStatusSummary` (via `useApplicationStatus`) and renders a **"Book Interview
Slot" button that is currently hardcoded `disabled` with no `onClick`** — this plan replaces
that placeholder with a real booking flow.

---

## 2. Booking eligibility rules

Confirmed directly from `InterviewBookingService.bookSlot`, in order:

1. If any course on the application already has status `interview_pending`, eligibility is
   already satisfied — skip further gating.
2. Otherwise:
   - `application.formStatus` must be `"submitted"`.
   - If `admissionCycle.assessmentRequired`, the student's assessment attempt must have
     reached `"result_published"` status (checked via the assessment module's own
     `AttemptService.findStatusForApplication`) — a student cannot book an interview before
     their assessment result is out.
3. **One booking per application** — a second `POST /bookings` for the same
   `application_id` is rejected.
4. **One active booking per student across ALL their applications** — if the student already
   has a `status: "booked"` booking anywhere, they must cancel it before booking another.
5. The chosen slot must exist, belong to the application's college, and be `status: "active"`.
6. Capacity is claimed atomically (race-safe) — a slot at max capacity is rejected even if it
   still showed as available a moment earlier.

**No mode selection at booking time** — `mode` (`gmeet` | `on_campus`) is a property of the
slot itself, chosen by picking that slot; the `mode` query param on the slots-list endpoint is
just an optional filter for browsing, not a separate booking input.

---

## 3. API inventory

Base path: `/api/v1/student/interviews`. Auth: `authenticate` + `authorizeUserType("student")`
on every route below.

### 1. List available slots

| Method | Path     |
| ------ | -------- |
| `GET`  | `/slots` |

**Query:** `college_id` (required), `mode?` (`gmeet`\|`on_campus`), `scheduled_date?`,
`date_from?`, `date_to?`, `page` (default 1), `limit` (default 20, max 100).

**Description:** Returns active slots for the college, already filtered to exclude full ones
(capacity check happens server-side, in-memory, before the response is built).

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "collegeId": "string",
      "mode": "gmeet",
      "scheduledDate": "2026-09-01",
      "startTime": "10:00",
      "endTime": "10:30",
      "durationMins": 30,
      "meetingUrl": null,
      "meetingId": null,
      "meetingPasscode": null,
      "campus": null,
      "venue": null,
      "interviewerId": null,
      "interviewerName": null,
      "interviewerEmail": null,
      "status": "active",
      "createdAt": "2026-08-20T00:00:00.000Z"
    }
  ],
  "meta": { "total": 12, "page": 1, "limit": 20, "hasNext": false }
}
```

> `campus`/`venue`/`meetingUrl` populate depending on the slot's `mode` — a `gmeet` slot
> carries meeting fields (once created/synced), an `on_campus` slot carries `campus`/`venue`.

### 2. Book a slot

| Method | Path        |
| ------ | ----------- |
| `POST` | `/bookings` |

**Body:** `{ application_id: string; slot_id: string }`

**Description:** Creates the booking, atomically claims slot capacity, marks the
application's eligible courses `interview_pending`, and (best-effort, never throws) creates a
Google Meet event for `gmeet` slots.

**Response `201`:**

```json
{
  "id": "string",
  "applicationId": "string",
  "applicationNumber": "string",
  "courses": [
    {
      "applicationCourseId": "string",
      "courseName": "string",
      "status": "interview_pending"
    }
  ],
  "studentId": "string",
  "studentName": "string",
  "studentPhone": null,
  "slot": { "...": "InterviewSlotItem, same shape as §3.1" },
  "instructions": {
    "heading": "string",
    "description": null,
    "instructions": ["string", "string"]
  },
  "status": "booked",
  "interviewScore": null,
  "interviewRemarks": null,
  "interviewOutcome": null,
  "evaluatedBy": null,
  "evaluatedAt": null,
  "bookedAt": "2026-08-21T00:00:00.000Z",
  "completedAt": null
}
```

### 3. Get my booking for an application

| Method | Path                                   |
| ------ | -------------------------------------- |
| `GET`  | `/bookings/application/:applicationId` |

**Response:** same `InterviewBookingItem` shape as above. 404 if no booking exists for that
application (or it isn't the caller's).

### 4. Cancel my booking

| Method  | Path                   |
| ------- | ---------------------- |
| `PATCH` | `/bookings/:id/cancel` |

**Description:** Only works while `status === "booked"`. Atomically frees the slot's
capacity.

**Response:** `InterviewBookingItem` with `status: "cancelled"`.

### 5. Request a reschedule

| Method | Path                                |
| ------ | ----------------------------------- |
| `POST` | `/bookings/:id/reschedule-requests` |

**Body:** `{ to_slot_id?: string; reason: string }` (`reason` required, max 1000 chars)

**Description:** Exactly **one non-rejected request per booking, ever** — a second attempt
is blocked unless the first was rejected. Must be submitted **≥30 minutes** before the
booking's slot actually starts. `to_slot_id` is an optional student preference; the admin
side does the actual slot swap on approval — a request never changes the booking's slot by
itself.

**Response `201`:**

```json
{
  "id": "string",
  "bookingId": "string",
  "studentId": "string",
  "fromSlotId": "string",
  "toSlotId": null,
  "reason": "string",
  "status": "pending",
  "reviewedBy": null,
  "reviewedAt": null,
  "reviewRemarks": null,
  "createdAt": "2026-08-21T00:00:00.000Z"
}
```

> There is no student-facing "approved → booking moved" push; the frontend should re-fetch
> the booking (`GET /bookings/application/:applicationId`) to see if `slot` changed once a
> request is reviewed, since approval happens entirely on the admin side.

---

## 4. Shared types

Everything below already exists in `packages/types/src/interview.ts`. No new types package
work needed for booking itself.

| Type                              | Used for                                                          |
| --------------------------------- | ----------------------------------------------------------------- |
| `InterviewMode`                   | `"gmeet" \| "on_campus"`                                          |
| `InterviewSlotStatus`             | `"active" \| "cancelled"`                                         |
| `InterviewBookingStatus`          | `"booked" \| "completed" \| "cancelled"`                          |
| `InterviewOutcome`                | `"recommended" \| "not_recommended"` (admin-set, post-completion) |
| `InterviewRescheduleStatus`       | `"pending" \| "approved" \| "rejected"`                           |
| `InterviewSlotItem`               | GET `/slots` list items                                           |
| `InterviewCampusLocation`         | Nested on `InterviewSlotItem` for `on_campus` slots               |
| `InterviewModeInstructions`       | Nested on `InterviewBookingItem.instructions`                     |
| `InterviewBookingItem`            | POST `/bookings` and GET `/bookings/application/:id` response     |
| `BookInterviewSlotInput`          | POST `/bookings` request body                                     |
| `InterviewRescheduleItem`         | POST `/reschedule-requests` response                              |
| `RequestInterviewRescheduleInput` | POST `/reschedule-requests` request body                          |

Also already used in `application-status-timeline.tsx` (from `packages/types/src/application.ts`):

| Type                         | Used for                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `InterviewStatusValue`       | `"not_scheduled" \| "booked" \| "completed" \| "cancelled" \| "rescheduled"` |
| `ApplicationInterviewStatus` | The `interview` field on `ApplicationStatusSummary`                          |

> **Known gap:** the exported `ListAvailableInterviewSlotsQuery` type in `packages/types`
> only has `college_id`/`mode?`/`scheduled_date?` — it's missing `date_from`/`date_to`/
> `page`/`limit` that the actual backend validator and controller both support. The service
> function's parameter list should accept those extra fields directly (a plain inline params
> object) rather than importing and relying solely on this type — do not treat the type as
> the source of truth for every supported query param.

---

## 5. Frontend implementation plan

Four phases, in `apps/college-web`, following the exact service → hook → component pattern
already established for the assessment module this session (`lib/services/assessment.service.ts`
/ `hooks/use-assessment.ts` as the direct template). college-admin's own interview
service/hook files (`apps/college-admin/lib/services/interviews.service.ts` /
`hooks/use-interviews.ts`) independently follow the identical idiom — both sides agree.

### Phase 1 — Service layer + hooks

- [ ] **New file** `lib/services/interview.service.ts`:
  - `listAvailableInterviewSlots(collegeId, filters?)` → `GET /slots`
  - `bookInterviewSlot(input: BookInterviewSlotInput)` → `POST /bookings`
  - `getMyInterviewBooking(applicationId)` → `GET /bookings/application/:applicationId`
  - `cancelMyInterviewBooking(bookingId)` → `PATCH /bookings/:id/cancel`
  - `requestInterviewReschedule(bookingId, input)` → `POST /bookings/:id/reschedule-requests`
- [ ] **New file** `hooks/use-interview.ts`:
  - `useAvailableInterviewSlots(collegeId, filters, enabled)` (query)
  - `useMyInterviewBooking(applicationId, enabled)` (query) — should tolerate a 404 as "no
    booking yet," not as an error state (same pattern as any "optional resource" fetch
    elsewhere in this app)
  - `useBookInterviewSlot(applicationId)` (mutation) — on success, invalidate **both**
    `QUERY_KEYS.myInterviewBooking(applicationId)` **and** `QUERY_KEYS.applicationStatus(applicationId)`
    (the timeline's "Attend Interview" step reads the latter — this is the same
    dual-invalidate pattern already used by `useStartAttempt` invalidating `assessmentStart`)
  - `useCancelInterviewBooking(applicationId)` (mutation) — same dual invalidate
  - `useRequestInterviewReschedule(bookingId, applicationId)` (mutation) — invalidate
    `myInterviewBooking(applicationId)` only (status flow doesn't change on a mere request)
- [ ] `lib/query-keys.ts` — add `interviewSlots(collegeId, filters)`,
      `myInterviewBooking(applicationId)` entries, following the existing key-naming convention.

### Phase 2 — Slot picker screen

- [ ] **New component** `components/interview/interview-slot-picker.tsx` — lists available
      slots (from Phase 1's hook), grouped by date, each slot showing mode (gmeet/on_campus icon),
      time, and remaining capacity if the API exposes it (check `InterviewSlotItem` at execution
      time — capacity count isn't in the DTO shown above, only filtered server-side; if it's truly
      absent, just show "Available" rather than a count). Optional mode/date filters if the slot
      list is large.
- [ ] Selecting a slot shows a confirm step (the instructions text from... actually
      `instructions` only comes back on the _booking_ response, not the slot list — the picker
      screen won't have mode instructions to show pre-booking; surface them only after a
      successful `POST /bookings` on the confirmation/detail screen, not before).
- [ ] Booking button calls `useBookInterviewSlot`; on success, navigate to the booking detail
      view (Phase 3).
- [ ] Handle the "you already have an active booking elsewhere" `ConflictError` from the API
      with a clear message (not a generic toast) — this is a real, expected rule a student will
      hit if they try to book from two different applications' pages.

### Phase 3 — Booking detail / confirmation screen

- [ ] **New component** `components/interview/interview-booking-detail.tsx` — shown once a
      booking exists for the application (`useMyInterviewBooking` returns data): slot date/time/
      mode, `instructions` (heading/description/list), meeting link if `gmeet` and populated,
      campus/venue if `on_campus`, and current `status`.
- [ ] Cancel action (only enabled while `status === "booked"`) — confirm dialog (per this
      app's `ConfirmDialog` convention, not `window.confirm`), then `useCancelInterviewBooking`.
- [ ] Reschedule-request action — a small form (`reason` textarea, required; optional slot
      picker reusing Phase 2's picker for `to_slot_id`) — disabled/hidden once a non-rejected
      request already exists for this booking (the API blocks a second one; check the booking's
      own state or a `GET` on reschedules if a "do I already have a pending request" read is
      needed — confirm at execution time whether `InterviewBookingItem` surfaces this or whether
      a separate reschedule-status fetch is required; not fully confirmed in this research pass,
      see Open Questions).
- [ ] If `status === "completed"`, show outcome/score/remarks read-only (no actions) — this
      is admin-set after the interview happens, informational only for the student.

### Phase 4 — Route + wiring

- [ ] New route: `app/college/[subdomain]/applications/[applicationId]/interview/page.tsx` +
      an auth-gated client wrapper, following the exact same pattern as
      `assessment/page.tsx`/`assessment-page-client.tsx` built this session (sign-in gate via
      `useAuthStore`, `SignInCta` fallback).
- [ ] The page renders `InterviewSlotPicker` when no booking exists yet, or
      `InterviewBookingDetail` once one does — same conditional-view pattern as
      `AssessmentRoom`'s `view` state machine.
- [ ] Wire the timeline's placeholder: in `application-status-timeline.tsx`, replace the
      hardcoded `disabled` "Book Interview Slot" button with a real `Link` to
      `.../interview`, matching how the "Start Assessment" button already links to
      `.../assessment`. Keep the gating logic already there (`assessmentDone` before showing it
      at all) — do not loosen it, since eligibility is enforced server-side anyway but the UI
      shouldn't invite a doomed request.
- [ ] Manual click-through: book a slot, confirm the timeline's "Attend Interview" step
      updates to reflect the booking (via the `applicationStatus` invalidation from Phase 1),
      cancel it, confirm the slot becomes bookable again, request a reschedule, confirm a second
      request is correctly blocked.

---

## 6. Open questions before building

**Slot capacity display**
`InterviewSlotItem` as currently typed has no visible "seats remaining" field — the backend
filters full slots server-side but doesn't appear to expose _how_ full a slot is. Confirm at
execution time whether the picker should just show "Available" with no count, or whether a
field was missed in this research pass.

**Pending-reschedule-request visibility**
Not fully confirmed whether `InterviewBookingItem` itself indicates "you already have a
pending reschedule request" (so the UI can disable the reschedule button proactively) or
whether the frontend must separately track/fetch reschedule state. Check
`InterviewRescheduleItem`'s relationship to the booking response at execution time before
finalizing Phase 3's reschedule-button-disabled logic.

**Mode instructions timing**
`instructions` (heading/description/list) only appears on the _booking_ response, not the
slot list — confirmed no pre-booking preview of mode instructions is available from this API
as designed. If a preview is wanted before a student commits to a slot, that would need a
different endpoint or a product decision to just show generic mode copy (gmeet vs on_campus)
client-side instead of pulling per-college instructions early.

**One active booking across applications — UX for the blocked case**
Since a student can only have one active booking across _all_ their applications (not just
one), and this app supports a student having multiple applications (to the same or different
colleges), the picker screen should surface this clearly rather than showing a generic error
— e.g. "You already have an interview booked for [other application] on [date] — cancel it
first to book here instead," which requires fetching that other booking's info from the
`ConflictError`'s context or a separate lookup. Confirm what the error response actually
contains (just a message, or the conflicting booking's id/application) before designing this
UX — not confirmed in this research pass.

---

_Sources: `apps/api/src/modules/interviews/` (routes, services, validators, repositories),
`packages/types/src/interview.ts`, `packages/types/src/application.ts`,
`apps/college-admin/lib/services/interviews.service.ts` (reference pattern),
`apps/college-web/components/applications/application-status-timeline.tsx` (existing
placeholder + read-only status consumption). Backend requires no changes for this plan._
