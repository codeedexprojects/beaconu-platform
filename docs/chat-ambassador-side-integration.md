# Chat — Ambassador-Side Integration Guide (Mobile App)

This is a handoff doc for the mobile team, covering the **campus ambassador side** of the chat feature — replying to students. The backend is fully built and hardened (REST + Socket.IO); there is no web UI for this anywhere in this repo — the mobile app is the only client for both sides. This doc covers the ambassador side only; the student side is documented separately in [`docs/chat-student-side-integration.md`](./chat-student-side-integration.md).

Companion doc: [`docs/chat-websocket-contract.md`](./chat-websocket-contract.md) — the exact wire-level socket contract (connect/auth/events). This doc doesn't repeat that detail.

All endpoints below are mounted under `/api/v1/blink/ambassador/chat/*` and require `authenticate` + `authorizeUserType("blink_ambassador")` — i.e. the same ambassador JWT access token used everywhere else in the app.

---

## ⚠️ Read this first — ambassadors never start a conversation

**There is no "message a student" action anywhere on the ambassador side.** Only a student can start a conversation (by picking an ambassador from a list on their side). A conversation only ever appears in an ambassador's inbox once a student has already sent the first message into it.

Concretely: there is no `GET /ambassadors`-equivalent (no "browse students" list) and no `POST /conversations` (no "start conversation") endpoint here at all — only 4 endpoints exist total, all scoped to conversations that already exist. Don't build a "new message" / "compose" entry point on this side — there is nothing for it to call.

---

## 1. Prerequisite — no new credential, no new setup

- **Auth**: the ambassador's existing JWT access token (from `POST /blink/login` — the single shared login endpoint used by every blink role: associates, employees, and campus ambassadors) is the only credential chat needs. Send it as `Authorization: Bearer <token>` on every REST call below, and as `auth: { token: accessToken }` on the socket handshake (see `chat-websocket-contract.md`).
- **Push notifications**: already wired. `POST /blink/login` already accepts an optional `fcm_token` field in the request body (`apps/api/src/modules/auth/validators/auth.validator.ts`, `loginSchema`) and stores it against the device — the same mechanism used by every other blink role. New chat messages push through that same existing registration; **nothing new to call or configure.**

---

## 2. Screen-by-screen flow

### Screen: Inbox / Conversation List

**`GET /blink/ambassador/chat/conversations?page=1&limit=20`**

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "CCV-12",
      "otherParticipant": {
        "id": "STU-45",
        "fullName": "Priya Menon",
        "avatarUrl": "https://cdn.beaconu.app/students/STU-45/avatar.jpg"
      },
      "lastMessageText": "Does the hostel fee include mess charges?",
      "lastMessageAt": "2026-09-01T11:29:40.000Z",
      "unreadCount": 1,
      "status": "active"
    }
  ],
  "meta": { "total": 8, "page": 1, "limit": 20, "hasNext": false }
}
```

- `otherParticipant` is always the **student** here — id, name, and avatar only (no phone/email exposed for a student, unlike the ambassador-listing response the student side reads, which does include an ambassador's phone number).
- Sum `unreadCount` across every row for an app-level inbox badge — same convention as the student side.
- Rows are ordered newest-activity-first; a conversation with no messages yet never appears here at all (impossible on this side, since a row only exists once a student has sent a first message).

---

### Screen: Chat (one conversation)

On open:

1. **`GET /blink/ambassador/chat/conversations/:id/messages?page=1&limit=20`** — newest-first. Paginate (`page=2`, `page=3`, ...) as the ambassador scrolls up for older history. Response shape is identical to the student side's message list (`id`, `conversationId`, `senderType`, `senderId`, `message`, `attachments`, `isRead`, `readAt`, `createdAt`) — `senderType` will be `"student"` or `"blink_ambassador"` depending on who sent each message.

```json
{
  "success": true,
  "data": [
    {
      "id": "CMG-59",
      "conversationId": "CCV-12",
      "senderType": "student",
      "senderId": "STU-45",
      "message": "Does the hostel fee include mess charges?",
      "attachments": [],
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-09-01T11:29:40.000Z"
    }
  ],
  "meta": { "total": 12, "page": 1, "limit": 20, "hasNext": false }
}
```

2. **`PATCH /blink/ambassador/chat/conversations/:id/read`** — call once when the screen opens, to clear the unread badge. No body.

```json
{ "success": true, "data": null }
```

This only marks messages _sent by the student_ as read and resets the ambassador's own unread counter — it never touches messages the ambassador sent themselves.

3. **Sending a reply — `POST /blink/ambassador/chat/conversations/:id/messages`**

Same request/response shape and validation rules as the student side — at least one of `message` / `attachments` is required.

```json
{ "message": "Sure, the hostel fee covers mess charges too." }
```

Response (`201`):

```json
{
  "success": true,
  "data": {
    "id": "CMG-60",
    "conversationId": "CCV-12",
    "senderType": "blink_ambassador",
    "senderId": "BLU-7",
    "message": "Sure, the hostel fee covers mess charges too.",
    "attachments": [],
    "isRead": false,
    "readAt": null,
    "createdAt": "2026-09-01T11:32:00.000Z"
  }
}
```

Attachments follow the same rule as the student side: already-uploaded `https://` URLs only (via the existing generic ambassador/blink upload flow), never raw file bytes.

**Error case**: replying to or reading a conversation the ambassador isn't part of → `404 Not Found` (never `403` — same "don't reveal existence" convention as the student side).

---

## 3. Socket lifecycle

Full wire contract: [`chat-websocket-contract.md`](./chat-websocket-contract.md). Same mechanism as the student side, just the other identity:

- Connect once at the app/session level after login, using the ambassador's own JWT. The socket auto-joins the personal room `blink_ambassador:{id}` — nothing else to subscribe to manually.
- On `chat:message` (`{ conversationId, messageId }`): if that conversation's Chat screen is open, refetch its messages; otherwise refetch the conversation list to bump the inbox badge.
- Reconnect with the refreshed access token on every reconnect/token-refresh (function-form `auth` option in `socket.io-client`) — same rejection rules as REST (invalid/expired/session-revoked token, or a `userType` other than `student`/`blink_ambassador`).
- If disconnected while a Chat screen is open, nothing is lost — the next REST fetch reflects everything.

---

## 4. Validator-imposed constraints to mirror in the UI

Identical to the student side — these validators (`apps/api/src/modules/chat/validators/chat.validator.ts`) are shared, actor-agnostic:

| Constraint              | Limit                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| Message length          | max 4000 characters                                                                        |
| Attachments per message | max 10                                                                                     |
| Attachment URL          | must be a real `https://` URL — reject `data:`/`javascript:`/anything else client-side too |
| Message body            | at least one of `message` or `attachments` required — disable Send until one is present    |

**New — message rate limit**: `POST .../messages` is capped at **30 messages per 60 seconds per sender** (`apps/api/src/modules/chat/lib/rate-limit.ts`). Exceeding it returns `429`:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "You're sending messages too quickly. Please wait a moment and try again."
  }
}
```

Surface this as a plain toast/snackbar — it's not expected to be hit in normal use, only under a bug (a retry loop) or abuse.

---

## 5. Explicit non-goals (not built, don't wait for these)

- **No way to start a new conversation** — see the callout at the top. An ambassador can only reply within threads a student already started.
- No typing indicators.
- No online/presence status for either side.
- No per-message read receipts — only the conversation-level unread counter/reset (`PATCH .../read`); `isRead`/`readAt` on an individual message only reflect the last bulk mark-read call, not a live per-message signal.

---

## 6. Error cases worth handling explicitly

| Scenario                                                        | Response           | Suggested UI                                                                                |
| --------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| Opening/replying to a conversation the ambassador isn't part of | `404`              | Generic "Conversation not found" — treat like a stale deep link, navigate back to the inbox |
| Sending with neither `message` nor `attachments`                | `400` (validation) | Should be prevented client-side (see §4) — defensive fallback only                          |
| Message over 4000 chars / attachments over 10                   | `400` (validation) | Client-side character counter / attachment-count cap (see §4)                               |
| Sending more than ~30 messages within 60 seconds                | `429`              | Toast: "Sending too quickly — please wait a moment"                                         |
