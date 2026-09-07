# Chat — Student-Side Integration Guide (Mobile App)

This is a handoff doc for the mobile team, covering the **student ("user") side** of the chat feature — messaging a campus ambassador. The backend is fully built and hardened (REST + Socket.IO); there is no web UI for this anywhere in this repo — the mobile app is the only client for both students and ambassadors. This doc covers the student side only; the ambassador side is a separate, symmetrical set of endpoints under `/blink/ambassador/chat/*` (not covered here).

Companion doc: [`docs/chat-websocket-contract.md`](./chat-websocket-contract.md) — the exact wire-level socket contract (connect/auth/events). This doc doesn't repeat that detail; it tells you which screen calls which endpoint and when to reconnect.

All endpoints below are mounted under `/api/v1/student/chat/*` and require `authenticate` + `authorizeUserType("student")` — i.e. the same student JWT access token used everywhere else in the app.

---

## 1. Prerequisite — no new credential, no new setup

- **Auth**: the student's existing JWT access token (from `POST /student/auth/verify-otp` or `POST /student/auth/firebase`) is the only credential chat needs. Send it as `Authorization: Bearer <token>` on every REST call below, and as `auth: { token: accessToken }` on the socket handshake (see `chat-websocket-contract.md`).
- **Push notifications**: already wired. The same login/verify-otp/firebase endpoints already accept an optional `fcm_token` field in the request body (`apps/api/src/modules/auth/validators/auth.validator.ts`) and store it against the student's device. New chat messages push through that same existing registration — **nothing new to call or configure for push to work.** If the app already sends `fcm_token` at login for other features, chat notifications work automatically.

---

## 2. Screen-by-screen flow

### Screen: Pick an Ambassador

Entry point — a student who hasn't started a conversation yet browses ambassadors at a college and picks one to message.

**`GET /student/chat/ambassadors?college_id={collegeId}`**

Lists every _active_ campus ambassador at that college. No enrollment or application prerequisite — any authenticated student can list ambassadors at any college, enrolled or not.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "BLU-7",
      "fullName": "Ananya Rao",
      "phoneNumber": "+919876543210",
      "avatarUrl": "https://cdn.beaconu.app/blink/BLU-7/avatar.jpg",
      "campusCode": "CLG-10"
    }
  ]
}
```

(No email, no `ambassadorType` — matches `CampusVisitAmbassadorContact`'s shape elsewhere in the app.)

Tapping an ambassador starts (or resumes) a conversation:

**`POST /student/chat/conversations`**

```json
{ "ambassador_id": "BLU-7" }
```

Idempotent — calling this again for the same ambassador always returns the _same_ conversation, never creates a duplicate. Safe to call every time the student taps that ambassador, without checking client-side whether a conversation already exists.

Response (`201`):

```json
{
  "success": true,
  "data": {
    "id": "CCV-12",
    "participant1Type": "student",
    "participant1Id": "STU-45",
    "participant2Type": "blink_ambassador",
    "participant2Id": "BLU-7",
    "lastMessageText": null,
    "lastMessageAt": null,
    "participant1Unread": 0,
    "participant2Unread": 0,
    "status": "active",
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  }
}
```

Navigate to the Chat screen using `data.id` as the conversation id.

**Error case**: if the ambassador has since gone inactive (left the program, deactivated, etc.) → `404 Not Found`. Show a generic "This ambassador is no longer available" state and send the student back to the ambassador list.

---

### Screen: Inbox / Conversation List

**`GET /student/chat/conversations?page=1&limit=20`**

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "CCV-12",
      "otherParticipant": {
        "id": "BLU-7",
        "fullName": "Ananya Rao",
        "avatarUrl": "https://cdn.beaconu.app/blink/BLU-7/avatar.jpg"
      },
      "lastMessageText": "Sure, the hostel fee covers mess charges too.",
      "lastMessageAt": "2026-09-01T11:32:00.000Z",
      "unreadCount": 2,
      "status": "active"
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20, "hasNext": false }
}
```

- `otherParticipant` is always the ambassador (students never see their own id here).
- For an app-level unread badge, sum `unreadCount` across every row in the list (there's no separate "total unread" endpoint).
- Row ordering is newest-activity-first (`lastMessageAt desc`).

---

### Screen: Chat (one conversation)

On open:

1. **`GET /student/chat/conversations/:id/messages?page=1&limit=20`** — newest-first. Paginate (`page=2`, `page=3`, ...) as the student scrolls up for older history.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "CMG-58",
      "conversationId": "CCV-12",
      "senderType": "blink_ambassador",
      "senderId": "BLU-7",
      "message": "Sure, the hostel fee covers mess charges too.",
      "attachments": [],
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-09-01T11:32:00.000Z"
    },
    {
      "id": "CMG-57",
      "conversationId": "CCV-12",
      "senderType": "student",
      "senderId": "STU-45",
      "message": "Does the hostel fee include mess charges?",
      "attachments": [
        {
          "url": "https://cdn.beaconu.app/students/STU-45/chat/receipt.jpg",
          "file_name": "receipt.jpg",
          "mime_type": "image/jpeg"
        }
      ],
      "isRead": true,
      "readAt": "2026-09-01T11:30:05.000Z",
      "createdAt": "2026-09-01T11:29:40.000Z"
    }
  ],
  "meta": { "total": 12, "page": 1, "limit": 20, "hasNext": false }
}
```

2. **`PATCH /student/chat/conversations/:id/read`** — call once when the screen opens, to clear the unread badge. No body.

```json
{ "success": true, "data": null }
```

This only marks messages _sent by the ambassador_ as read and resets the student's own unread counter — it never touches messages the student sent themselves.

3. **Sending a message — `POST /student/chat/conversations/:id/messages`**

At least one of `message` / `attachments` is required (both may be present together).

```json
{
  "message": "Does the hostel fee include mess charges?",
  "attachments": [
    {
      "url": "https://cdn.beaconu.app/students/STU-45/chat/receipt.jpg",
      "file_name": "receipt.jpg",
      "mime_type": "image/jpeg"
    }
  ]
}
```

Attachments must already be uploaded via the existing generic student upload flow (presign → PUT → verify) before calling this — this endpoint only accepts the resulting URL(s), it does not accept file bytes.

Response (`201`):

```json
{
  "success": true,
  "data": {
    "id": "CMG-59",
    "conversationId": "CCV-12",
    "senderType": "student",
    "senderId": "STU-45",
    "message": "Does the hostel fee include mess charges?",
    "attachments": [
      {
        "url": "https://cdn.beaconu.app/students/STU-45/chat/receipt.jpg",
        "file_name": "receipt.jpg",
        "mime_type": "image/jpeg"
      }
    ],
    "isRead": false,
    "readAt": null,
    "createdAt": "2026-09-01T11:35:00.000Z"
  }
}
```

This response **is** the delivery confirmation for a message you sent — there is no separate socket "sent" acknowledgment (see `chat-websocket-contract.md`'s "what the socket does not do" section).

**Error case**: sending into (or reading/listing) a conversation the student isn't a participant of → `404 Not Found` (never `403` — matches this codebase's "don't reveal existence" convention across every module). In practice this should only happen from a stale/tampered conversation id, since the student only ever reaches a conversation id through `startOrGetConversation`'s own response.

---

## 3. Socket lifecycle

Full wire contract: [`chat-websocket-contract.md`](./chat-websocket-contract.md). Summary for how it plugs into the screens above:

- **Connect once at the app/session level**, right after login succeeds (not per-screen, not re-connecting every time the Chat screen opens/closes). Reuse the app's single socket connection across the Inbox and Chat screens.
- On `chat:message` (payload: `{ conversationId, messageId }`):
  - If that `conversationId`'s Chat screen is currently open → refetch messages for it (`GET .../messages`).
  - Otherwise → refetch the conversation list (`GET /student/chat/conversations`) to bump the inbox preview/badge.
- **Reconnect with the refreshed access token** whenever the app's token refreshes or the socket disconnects/reconnects — same token rules as every REST call (rejected if invalid/expired/session-revoked, or if the JWT's `userType` isn't `student`). Use `socket.io-client`'s function-form `auth` option so this is automatic (example in the companion doc).
- If the socket is disconnected while the student is on a Chat screen, nothing is lost — the next REST fetch (e.g. pull-to-refresh, or just reopening the screen) reflects everything. Don't build any "reconnecting..." blocking state around it.

---

## 4. Validator-imposed constraints to mirror in the UI

These are enforced server-side (`apps/api/src/modules/chat/validators/chat.validator.ts`) — mirror them client-side too so the student gets instant feedback instead of a round-trip error:

| Constraint              | Limit                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Message length          | max 4000 characters                                                                                                  |
| Attachments per message | max 10                                                                                                               |
| Attachment URL          | must be a real `https://` URL — reject anything else (including `data:`/`javascript:`) before even attempting upload |
| Message body            | at least one of `message` or `attachments` required — disable the Send button until one is present                   |

---

## 5. Explicit non-goals (not built, don't wait for these)

- No typing indicators.
- No online/presence status for either side.
- No per-message read receipts — only the conversation-level unread counter/reset (`PATCH .../read`) exists; there's no "seen at 11:32" on an individual message beyond its own `isRead`/`readAt` fields (which only reflect the last bulk mark-read call, not a live per-message signal).
- No ambassador-initiated conversations — a student always starts the thread by picking an ambassador; an ambassador can only reply within a conversation a student already started. There is no "ambassador messages you first" flow to build for.

---

## 6. Error cases worth handling explicitly

| Scenario                                                             | Response              | Suggested UI                                                                                  |
| -------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| No active ambassadors at a college                                   | `200` with `data: []` | Empty state on the Pick-an-Ambassador screen — not an error                                   |
| Starting a conversation with an ambassador who's since gone inactive | `404`                 | "This ambassador is no longer available" — return to the ambassador list                      |
| Opening/messaging a conversation the student isn't part of           | `404`                 | Generic "Conversation not found" — treat like a stale deep link, navigate back to the inbox   |
| Sending with neither `message` nor `attachments`                     | `400` (validation)    | Should be prevented client-side (see §4) — this is a defensive fallback, not an expected path |
| Message over 4000 chars / attachments over 10                        | `400` (validation)    | Client-side character counter / attachment-count cap (see §4)                                 |
