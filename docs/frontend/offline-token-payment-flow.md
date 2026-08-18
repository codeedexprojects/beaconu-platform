# Offline Token Payment — Frontend Implementation Plan

Audience: whoever builds the student-facing payment UI (`apps/college-web`, per
root `CLAUDE.md` — "apply, pay fees" is that app's job) and the college-admin
review queue UI (`apps/college-admin`). Backend is fully built; this document
is the handoff contract — every endpoint, exact request/response JSON, screen
breakdown, and error text. No frontend code exists for this yet in either app
(confirmed via repo search) — this is a from-scratch build on both sides.

---

## 1. Overview

Alongside the existing Razorpay-based online token payment
(`POST .../token/initiate` + `.../token/confirm`), a student can submit an
**offline** payment (demand draft or bank transfer) with proof, an amount,
and an optional note. It goes into a **pending review** state. A
college-admin staff member reviews it and either:

- **Approves ("received")** — must manually re-type the amount actually
  received (double-entry check against the configured token amount). On
  match, the course is finalized exactly like a successful online payment
  (offer letter marked paid, invoice generated).
- **Rejects** — with a required note. The student can then **resubmit** the
  same transaction with corrected proof/details, which goes back into the
  review queue.

Both online and offline methods can be independently enabled/disabled per
admission cycle by college-admin (`token_online_payment_enabled` /
`token_offline_payment_enabled`, both default `true`). The frontend must
check these flags before showing either payment option — see §5.

```
Student                          College-Admin
  │                                    │
  ├─ Submit offline payment ─────────►│
  │  (status: pending,                │
  │   verificationStatus:             │
  │   pending_verification)           │
  │                                    ├─ Reviews in queue
  │                                    │
  │◄──── Rejected (note) ─────────────┤  Reject
  │  verificationStatus: rejected     │
  │                                    │
  ├─ Resubmit (same transaction) ────►│
  │  verificationStatus back to       │
  │  pending_verification             │
  │  (rejectionReason still shown     │
  │   → isResubmission: true)         │
  │                                    │
  │◄──── Verified ─────────────────────┤  Verify (staff types
  │  status: completed,               │  received_amount)
  │  course → token_paid,             │
  │  offer letter marked paid,        │
  │  invoice generated async          │
```

---

## 2. Conventions

- Base URL (student): `/api/v1/student/payments/...`
- Base URL (college-admin): `/api/v1/college-admin/payments/...`
- Auth: `Authorization: Bearer <token>` (student or staff token respectively)
- Response envelope:
  ```json
  { "success": true, "data": { ... }, "meta"?: { ... } }
  { "success": false, "error": { "code": "...", "message": "..." } }
  ```
- All money fields are strings (Decimal-safe), e.g. `"amount": "25000.00"`.
- All dates/timestamps are ISO 8601 strings, or `null`.

### Proof upload

There is **no dedicated "payment proof" upload endpoint yet**. The closest
existing student upload context is `refund-proof` (same shape: presign →
client PUT → verify → get a permanent key/URL back). Recommend reusing it
for now:

```
POST /api/v1/student/uploads/refund-proof/presign
Body: { "mimeType": "application/pdf" }
Response: { "data": { "uploadUrl": "...", "key": "students/{studentId}/refund-proof/{uuid}.pdf" } }

# client PUTs the file directly to uploadUrl (S3 presigned PUT), then:

POST /api/v1/student/uploads/refund-proof/verify
Body: { "key": "students/{studentId}/refund-proof/{uuid}.pdf" }
Response: { "data": { "url": "https://.../students/{studentId}/refund-proof/{uuid}.pdf" } }
```

Use the returned `url` as `proof_url` in the submit/resubmit calls below.
(If a dedicated `payment-proof` upload context is wanted instead of reusing
`refund-proof`, that's a small backend addition — flag it back rather than
building around a workaround permanently.)

---

## 3. Student endpoints

### 3.1 Check current offline status

```
GET /api/v1/student/payments/courses/:applicationCourseId/token/offline/status
```

No body. Returns the latest offline submission for this course, or `null` if
the student has never submitted one — use this to decide which screen state
to render (see §6).

**Response `data` (or `null`):**

```json
{
  "id": "TXN-000123",
  "transactionNumber": "TOK-000123",
  "amount": "25000.00",
  "currency": "INR",
  "status": "pending",
  "paymentMethod": "demand_draft",
  "proofUrl": "https://.../students/STU-1/refund-proof/abc.pdf",
  "proofFileName": "dd-receipt.pdf",
  "ddNumber": "DD123456",
  "ddBankName": "State Bank of India",
  "ddDate": "2026-08-10T00:00:00.000Z",
  "bankRefNumber": null,
  "studentNote": "Paid via demand draft at the branch",
  "verificationStatus": "pending_verification",
  "verifiedBy": null,
  "verifiedAt": null,
  "rejectionReason": null,
  "isResubmission": false,
  "paidAt": null,
  "createdAt": "2026-08-18T10:00:00.000Z"
}
```

`status`: `"pending" | "completed" | "rejected"`.
`verificationStatus`: `"pending_verification" | "verified" | "rejected"`.

### 3.2 Submit an offline payment

```
POST /api/v1/student/payments/courses/:applicationCourseId/token/offline/submit
```

**Request body:**

```json
{
  "payment_method": "demand_draft",
  "amount": 25000,
  "proof_url": "https://.../students/STU-1/refund-proof/abc.pdf",
  "proof_file_name": "dd-receipt.pdf",
  "dd_number": "DD123456",
  "dd_bank_name": "State Bank of India",
  "dd_date": "2026-08-10",
  "bank_ref_number": null,
  "note": "Paid via demand draft at the branch"
}
```

- `payment_method`: `"demand_draft" | "bank_transfer"` — required.
- `amount`: required, **must exactly match** the course's configured token
  amount or the request 409s (see §7). Fetch the configured amount first via
  the application status endpoint's `amountDetails.tokenAmount` (§5) so the
  form can show/validate it before submitting.
- `proof_url`: required (from the upload flow in §2).
- `proof_file_name`, `dd_number`, `dd_bank_name`, `dd_date`, `bank_ref_number`,
  `note`: all optional. Show/hide `dd_number`/`dd_bank_name`/`dd_date` for
  `demand_draft`, `bank_ref_number` for `bank_transfer` — both are accepted
  regardless, but only one set makes sense per method.

**Response `201`:** same shape as §3.1's `data` (the newly created row,
`status: "pending"`, `verificationStatus: "pending_verification"`,
`isResubmission: false`).

### 3.3 Resubmit a rejected payment

```
PATCH /api/v1/student/payments/courses/token/offline/:transactionId/resubmit
```

`transactionId` is the `id` from §3.1's status response (or from the
original §3.2 submit response). Only works while
`verificationStatus === "rejected"`.

**Request body:** identical shape to §3.2 — it's a full resubmission, not a
partial patch. Every field is re-sent (send the corrected proof/details).

**Response `200`:** same shape as §3.1, `status` back to `"pending"`,
`verificationStatus` back to `"pending_verification"`. Note:
`rejectionReason` from the prior rejection is **still populated** in this
response — that's intentional (it's how the admin review queue flags it as a
resubmission), don't treat a non-null `rejectionReason` here as "still
rejected"; trust `verificationStatus`/`status` instead.

---

## 4. College-admin endpoints

### 4.1 List the review queue

```
GET /api/v1/college-admin/payments/offline-review-queue?page=1&limit=20&status=pending_verification
```

`status` query param optional: `"pending_verification" | "verified" | "rejected"`
(omit for all). Paginated (`meta`: `page, limit, total, totalPages,
hasNextPage, hasPreviousPage`).

**Response `data[]` item** — same shape as §3.1 plus:

```json
{
  "id": "TXN-000123",
  "transactionNumber": "TOK-000123",
  "amount": "25000.00",
  "currency": "INR",
  "status": "pending",
  "paymentMethod": "demand_draft",
  "proofUrl": "https://.../abc.pdf",
  "proofFileName": "dd-receipt.pdf",
  "ddNumber": "DD123456",
  "ddBankName": "State Bank of India",
  "ddDate": "2026-08-10T00:00:00.000Z",
  "bankRefNumber": null,
  "studentNote": "Paid via demand draft at the branch",
  "verificationStatus": "pending_verification",
  "verifiedBy": null,
  "verifiedAt": null,
  "rejectionReason": null,
  "isResubmission": false,
  "paidAt": null,
  "createdAt": "2026-08-18T10:00:00.000Z",
  "applicationCourseId": "APC-000045",
  "courseName": "B.Tech Computer Science",
  "studentName": "Aisha Khan",
  "studentEmail": "aisha@example.com"
}
```

`isResubmission: true` means this row was rejected before and the student
has resubmitted — surface this clearly in the queue (e.g. a "Resubmitted"
badge) since `rejectionReason` is still shown alongside the new proof.

### 4.2 Review a submission (approve/reject)

```
PATCH /api/v1/college-admin/payments/offline/:transactionId/review
```

**Reject:**

```json
{ "decision": "rejected", "note": "DD number doesn't match the uploaded proof" }
```

`note` is required when rejecting (client-side validate too, but the server
enforces it regardless).

**Response `200`:**

```json
{
  "id": "TXN-000123",
  "transactionNumber": "TOK-000123",
  "amount": "25000.00",
  "currency": "INR",
  "status": "rejected",
  "paymentMethod": "demand_draft",
  "proofUrl": "https://.../abc.pdf",
  "proofFileName": "dd-receipt.pdf",
  "ddNumber": "DD123456",
  "ddBankName": "State Bank of India",
  "ddDate": "2026-08-10T00:00:00.000Z",
  "bankRefNumber": null,
  "studentNote": "Paid via demand draft at the branch",
  "verificationStatus": "rejected",
  "verifiedBy": "STF-12",
  "verifiedAt": "2026-08-18T11:00:00.000Z",
  "rejectionReason": "DD number doesn't match the uploaded proof",
  "isResubmission": false,
  "paidAt": null,
  "createdAt": "2026-08-18T10:00:00.000Z",
  "finalized": false
}
```

**Verify ("received"):**

```json
{ "decision": "verified", "received_amount": 25000 }
```

`received_amount` is **required** when verifying — this is the
double-entry check: staff must manually type the amount they actually
received (not just click approve). It's validated against the configured
token amount server-side; a mismatch 409s and finalizes nothing (see §7) —
**the UI must present a real number input here, never a pre-filled/disabled
field showing the student's claimed amount**, or the whole point of the
double-entry check is defeated.

**Response `200`** (on successful match):

```json
{
  "id": "TXN-000123",
  "transactionNumber": "TOK-000123",
  "amount": "25000.00",
  "currency": "INR",
  "status": "completed",
  "paymentMethod": "demand_draft",
  "proofUrl": "https://.../abc.pdf",
  "proofFileName": "dd-receipt.pdf",
  "ddNumber": "DD123456",
  "ddBankName": "State Bank of India",
  "ddDate": "2026-08-10T00:00:00.000Z",
  "bankRefNumber": null,
  "studentNote": "Paid via demand draft at the branch",
  "verificationStatus": "verified",
  "verifiedBy": "STF-12",
  "verifiedAt": "2026-08-18T11:05:00.000Z",
  "rejectionReason": null,
  "isResubmission": false,
  "paidAt": "2026-08-18T11:05:00.000Z",
  "createdAt": "2026-08-18T10:00:00.000Z",
  "finalized": true,
  "applicationCourseId": "APC-000045",
  "studentId": "STU-1"
}
```

Note: `finalized: true` only appears on a successful "verified" response
(with `applicationCourseId`/`studentId` alongside it); a "rejected" response
always has `finalized: false` and does **not** include those two fields —
don't assume they're always present.

On `finalized: true`, the course's `ApplicationCourse.status` flips to
`"token_paid"`, the offer letter is marked paid, and an invoice/receipt is
generated asynchronously (same as the online flow) — no separate action
needed from the UI, just refresh whatever screen shows the course/offer
status.

**Fetching the invoice afterward:** the receipt is generated a few seconds
_after_ this call returns (async job), so don't expect it immediately. Once
ready, look it up with the `id` from this response (student-side):

```
GET /api/v1/student/payments/receipts/by-transaction/:transactionId
```

using this response's `id` as `:transactionId` — returns the same shape as
one item of `GET /payments/receipts` (`documentUrl`, `receiptNumber`, etc.),
or `404` if the async job hasn't run yet (poll/refetch after a few seconds).

---

## 5. Where the enable/disable flags live

`GET /api/v1/student/application-forms/:id/application/status` (the
application status endpoint) now returns, inside `amountDetails`:

```json
"amountDetails": {
  "...": "...",
  "tokenAmount": "25000.00",
  "paymentMethods": { "online": true, "offline": true }
}
```

Fetch this **before** rendering the token payment screen and use
`paymentMethods.online` / `paymentMethods.offline` to show/hide the
Razorpay-vs-offline options. If a method is toggled off after the student is
already on the screen, the submit/initiate call will 409 with a specific
message (§7) — handle that as a fallback, but the primary UX should already
have hidden the disabled option.

---

## 6. Suggested screen states (driven by §3.1's response)

| §3.1 response                                                     | Screen state                                                                                                                     |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `null`                                                            | Show the payment method picker (online vs offline, per §5's flags) and the offline submission form if chosen                     |
| `status: "pending"`, `verificationStatus: "pending_verification"` | "Submitted — awaiting review" state, no action available, show the submitted proof details                                       |
| `verificationStatus: "rejected"`                                  | "Rejected" state — show `rejectionReason`, offer a "Resubmit" action pre-filling the form from the last submission, calling §3.3 |
| `status: "completed"`, `verificationStatus: "verified"`           | "Paid" state — same as the online flow's paid state                                                                              |

This mirrors how the online flow's own transaction status should already be
checked before showing "Pay Now" vs "Payment pending confirmation".

---

## 7. Errors (verbatim messages, all `ConflictError` unless noted)

| Endpoint                            | Message                                                                          | When                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Submit                              | `This course must be shortlisted before the token can be paid`                   | Course not yet shortlisted                                                     |
| Submit                              | `The token for this course has already been paid`                                | Already `token_paid`                                                           |
| Submit                              | `Offline payment is not available for this admission cycle`                      | `token_offline_payment_enabled: false`                                         |
| Submit / Resubmit                   | `A token amount has not been configured for this course yet`                     | No `token_amount` set by college-admin                                         |
| Submit / Resubmit                   | `The submitted amount must match the configured token amount of {amount}`        | `amount` doesn't match                                                         |
| Submit                              | `A payment submission for this course is already awaiting review`                | Another pending transaction (online or offline) exists                         |
| Resubmit                            | `Only a rejected submission can be resubmitted`                                  | `verificationStatus !== "rejected"`                                            |
| Resubmit / status / not found cases | `Transaction not found` / `Application course not found`                         | 404, wrong id or not owned by this student                                     |
| Online initiate                     | `Online payment is not available for this admission cycle`                       | `token_online_payment_enabled: false`                                          |
| Review (verify)                     | `The received amount must exactly match the configured token amount of {amount}` | `received_amount` mismatch — nothing finalized                                 |
| Review                              | `Transaction not found`                                                          | 404 — wrong id or not currently `pending_verification` (e.g. already reviewed) |

All of the above map to the standard error envelope
(`{ success: false, error: { code, message } }`) — use `error.message`
directly for user-facing text, it's already written for that.
