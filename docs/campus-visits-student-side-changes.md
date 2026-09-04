# Campus Visits Redesign — Student-Side API Changes

Handoff doc for the student/mobile frontend covering everything the Campus Visits redesign (single working-hours range, holiday calendar, admin cancellation) actually changes on the **student-facing** surface. Every route below already existed before this redesign — **no student route was added, removed, or renamed.** What changed is response semantics on two endpoints, a new possible error on two endpoints, and a new push notification shape. There is also one real gap flagged at the end: no student endpoint currently exposes the college's working hours or holiday dates.

Base path: `/api/v1/student/campus-visits`. Auth: `Authorization: Bearer <accessToken>`, `authorizeUserType("student")`. Envelope: `{ success, data, meta? }` / `{ success: false, error: { code, message } }`.

---

## 1. `POST /api/v1/student/campus-visits` (book a visit)

**Request body — unchanged, byte-for-byte identical to before this redesign.** Students have never sent a time and still don't.

```json
{
  "college_id": "CLG-10",
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "phone_number": "+91 98765 43210",
  "course_interest": "B.Tech Computer Science",
  "additional_visitors_count": 1,
  "guests": [{ "name": "Rahim Khan", "relation": "Father" }],
  "reason_for_visit": "Want to tour the campus and meet the CS department before applying.",
  "proposed_date": "2026-09-15"
}
```

`course_interest`, `additional_visitors_count` (default `0`), `guests` (max 10) are optional. `reason_for_visit` is 10–500 chars. `proposed_date` is `YYYY-MM-DD`.

**Response — `201`, shape unchanged:**

```json
{
  "success": true,
  "message": "Campus visit booked successfully",
  "data": {
    "id": "CMV-42",
    "ambassador": null,
    "college": {
      "id": "CLG-10",
      "name": "Sacred Heart College",
      "address": "MG Road",
      "city": "Kochi",
      "district": "Ernakulam",
      "state": "Kerala",
      "pinCode": "682001"
    }
  }
}
```

`ambassador` is `null` at booking time — it's filled in only once an ambassador self-claims the visit (unrelated to this redesign).

### What actually changed here

1. **New possible `409 Conflict`** if `proposed_date` falls on a date the college has marked as a holiday/closure:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "This date is marked as a holiday and isn't available for campus visits."
  }
}
```

Previously, the only date-related rejections were "that weekday is off" and "less than 2 hours' notice." This is a new, distinct rejection reason — **the frontend should render its own message for this case** rather than folding it into the generic weekday-off copy, since it's a one-off exception day, not a recurring weekday rule.

2. **New possible `409 Conflict`** if the college hasn't set up its visit-time settings at all yet (a config gap on the college's side, not something the student did wrong):

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "This college hasn't configured a campus visit time yet."
  }
}
```

3. **`proposedTime`'s source changed** (not visible as a request-shape change, but matters if the frontend ever displays "your visit is at HH:MM" from the booking response or a subsequent detail fetch — see §3). It used to be read off that specific weekday's own `time` field (`CampusVisitAvailability.time`, one value per weekday, up to 7 different values across the week). It is now always the college's single shared `visitStartTime` (`CampusVisitSettings.visitStartTime`), regardless of which weekday the booked date falls on. Practically: every open day for a given college now shows the same visit time — no more per-weekday variation.

All pre-existing checks are unchanged: weekday-off rejection, the 2-hour minimum advance notice (now measured against the settings' `visitStartTime` instead of a weekday's `time`, same 2-hour rule), and capacity-full rejection.

---

## 2. `PATCH /api/v1/student/campus-visits/:visitId/reschedule`

**Request body — unchanged:**

```json
{ "proposed_date": "2026-09-18" }
```

**Response — `200`, unchanged (`null` data, matches every other action-only endpoint in this module):**

```json
{
  "success": true,
  "message": "Campus visit rescheduled successfully",
  "data": null
}
```

### What changed

Identical two changes as booking (§1): the new date holiday `409` and the new "no settings configured" `409` can now also happen on reschedule, and the visit's `proposedTime` after a successful reschedule is sourced from the same shared `CampusVisitSettings.visitStartTime`, not a per-weekday value. Everything else — `RESCHEDULABLE_STATUSES` gate (`pending`/`confirmed` only), ownership check, rescheduling logs `previousProposedDate`/`previousProposedTime`/`rescheduledAt` — is unchanged.

---

## 3. `GET /api/v1/student/campus-visits/:visitId` and `GET /api/v1/student/campus-visits` (list mine)

**No request or response shape change at all.** `CampusVisit`/`CampusVisitListItem` gained no new fields from this redesign. Two things about existing fields are worth knowing when rendering them:

- `proposedTime`: same meaning as always ("the scheduled time of this visit"), just now always equal to the college's single working-hours start time rather than a per-weekday value.
- `cancellationReason`: this field can now contain an **admin-authored** message, not only a student-authored one — see §5 below. There's no field distinguishing who wrote it; if the frontend wants to show "Cancelled by you" vs. "Cancelled by the college," it needs to infer that from `status` transition context (a self-cancel is always a normal `cancelled`, same as an admin cancel — the row shape doesn't disambiguate). Flagging this since it's a real, if minor, gap the frontend may want to work around by just displaying the reason text as-is, prefixed generically ("Reason: …") rather than attributing it to either party.

---

## 4. `GET /api/v1/student/campus-visits/availability?college_id=`

**No request change.** Response is `CampusVisitAvailabilityEntry[]`, one row per weekday:

```json
[
  {
    "id": "CVA-1",
    "collegeId": "CLG-10",
    "weekday": "Monday",
    "maxCapacity": 5,
    "isOff": false,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

### What changed

**The `time` field is gone from this response.** Before this redesign each weekday row carried its own `time` (`HH:MM:SS`); it's been removed from `CampusVisitAvailabilityEntry` entirely (backing DB column dropped). If the current student frontend was reading `entry.time` anywhere (e.g. to show "Mondays: 10:00 AM" per weekday), that will now be `undefined` — **this needs to be replaced**, and per the gap in §6 below, there's currently nowhere else for a student client to fetch the replacement value from. `maxCapacity`/`isOff`/`weekday` are unchanged.

---

## 5. New push notification: admin-initiated cancellation

This is genuinely new — there was no student-facing notification for a visit being cancelled by anyone other than the student themself before this redesign (a student's own self-cancel never notified them, only the ambassador). Now, when college-admin cancels a booking (either a single visit, or as part of a "cancel all bookings on this date" bulk action), the student receives a push:

```json
{
  "title": "Your campus visit was cancelled",
  "body": "<the message the college-admin staff member typed, verbatim>",
  "data": {
    "type": "campus_visit_admin_cancelled",
    "visitId": "CMV-42"
  }
}
```

Key points for the frontend/mobile team:

- **`body` is free text typed by a college-admin staff member** — there is no fixed template. It could be one sentence or several; don't assume any particular structure or length beyond what push payload limits already impose.
- **`data.type` is a new, distinct value** (`"campus_visit_admin_cancelled"`) — if the app already switches on `data.type` for push routing/deep-linking, add a case for this one (presumably routing to the visit detail screen, same as other campus-visit push types would).
- The visit's `status` becomes `cancelled` and `cancellationReason` is set to the same message (see §3's note on this field's dual authorship).
- This is best-effort/fire-and-forget server-side (wrapped in try/catch, logged on failure) — the cancellation itself always succeeds even if the push fails to send. The frontend shouldn't assume a push is a guaranteed side effect of a cancelled visit; if the app has any polling/refresh-on-foreground behavior for campus visits, that remains the more reliable way to catch a status change the push might have missed.

---

## 6. Known gap — no student-facing endpoint for working hours or holiday dates

Two new pieces of data exist server-side from this redesign, and **neither is exposed to students today**:

- **`CampusVisitSettings`** (the working-hours range, e.g. "9:00 AM – 5:00 PM") — only reachable via `GET /college-admin/campus-visits/settings`, staff-only (`authorizeUserType("staff_member")`).
- **`CampusVisitDateOverride`** (the list of upcoming holiday/closure dates) — only reachable via `GET /college-admin/campus-visits/calendar?year=&month=`, also staff-only.

If the student/mobile app wants to:

- Show "Visiting Hours: 9 AM – 5 PM" anywhere on the booking screen, or
- Grey out / disable holiday dates in the date picker before the student even attempts to book them (rather than letting them pick a holiday date and only finding out via the new `409` in §1),

...there is currently **no API for that**. The only way today's student app can discover a holiday date is by attempting to book it and handling the `409` from §1 — which works, but makes for a worse UX than pre-filtering the date picker.

This wasn't in scope for the original request (which was college-admin-only), but it's the natural next piece if the student booking screen is meant to reflect the new working-hours/holiday model visually rather than just reactively rejecting bad picks. Recommend a small follow-up: a public or student-scoped `GET /student/campus-visits/schedule?college_id=` returning `{ visitStartTime, visitEndTime, holidayDates: string[] }` (or similar), sourced from the same two tables college-admin already reads.

---

## Summary table

| Endpoint                   | Request change | Response change                                                  | New errors                                        |
| -------------------------- | -------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| `POST /campus-visits`      | None           | `proposedTime` now sourced from shared settings, not per-weekday | `409` holiday date, `409` settings not configured |
| `PATCH /:id/reschedule`    | None           | Same `proposedTime` source change                                | Same two new `409`s                               |
| `GET /:id`, `GET /` (list) | —              | No shape change; `cancellationReason` may now be admin-authored  | —                                                 |
| `GET /availability`        | None           | `time` field removed from each weekday entry                     | —                                                 |
| _(new)_ push notification  | —              | New `campus_visit_admin_cancelled` push, admin free-text body    | —                                                 |
| _(gap)_                    | —              | No endpoint exposes working hours / holiday dates to students    | —                                                 |
