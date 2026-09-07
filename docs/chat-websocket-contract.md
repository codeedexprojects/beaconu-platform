# Chat — Socket.IO Contract (Student ↔ Campus Ambassador)

This is the real-time complement to the REST endpoints under `student/chat/*.bru` and `blink/ambassador/chat/*.bru`. **REST is still the source of truth** — a client should always paginate `GET .../conversations/:id/messages` when a conversation screen opens, and use `GET .../conversations` to build the inbox/list. The socket connection exists purely to push live updates while the app is open; if it disconnects, nothing is lost — the next REST fetch reflects everything.

## Connecting

- Library: `socket.io-client` (server is `socket.io` v4).
- URL: same host/port as the REST API (e.g. `https://api.beaconu.app`), default namespace (`/`).
- Auth: pass the same JWT access token used for REST calls, via the handshake `auth` payload — **not** a header:

```js
import { io } from "socket.io-client";

const socket = io("https://api.beaconu.app", {
  auth: { token: accessToken },
});
```

- The server rejects the connection (via the `connect_error` event) if:
  - `token` is missing.
  - The token is invalid/expired, or its session has been revoked (same rules as every REST call).
  - The token's `userType` isn't `student` or `blink_ambassador` — no other actor type is wired into chat.
- On success, the socket is automatically joined to one personal room keyed by the caller's own identity — nothing else to do client-side to "subscribe."

## Reconnecting

Re-pass the current (possibly refreshed) token on every reconnect attempt — `socket.io-client`'s default `auth` option can be a function so this happens automatically:

```js
const socket = io(baseUrl, {
  auth: (cb) => cb({ token: getCurrentAccessToken() }),
});
```

## Events

### `chat:message` (server → client)

Fired the moment the _other_ participant sends a message via `POST .../conversations/:id/messages`, straight to the recipient's socket if they're currently connected.

```json
{
  "conversationId": "CCV-12",
  "messageId": "CMG-58"
}
```

This is intentionally a thin "something changed" signal, not the full message body — on receiving it, fetch the new message via `GET .../conversations/:id/messages` (or just refetch the conversation list for an inbox badge update) rather than trusting the socket payload as the full record. This avoids the socket and REST payload shapes ever needing to be kept in lockstep.

Typical handling:

```js
socket.on("chat:message", ({ conversationId }) => {
  if (conversationId === currentlyOpenConversationId) {
    refetchMessages(conversationId);
  } else {
    refetchConversationList(); // bump the inbox badge/preview
  }
});
```

## What the socket does **not** do

- It does not replace `PATCH .../conversations/:id/read` — read receipts are still an explicit REST call.
- It does not confirm delivery of a message you sent — the `POST .../messages` REST response is the confirmation; the socket event only ever notifies the _other_ side.
- There is no typing-indicator, presence, or "online" event in this pass — not built.
