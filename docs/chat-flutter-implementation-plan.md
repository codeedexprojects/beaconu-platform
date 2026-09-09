# Chat — Flutter Implementation Plan (Both Apps)

This is a step up in concreteness from the two contract docs — [`chat-student-side-integration.md`](./chat-student-side-integration.md) and [`chat-ambassador-side-integration.md`](./chat-ambassador-side-integration.md) — which cover _what_ to call. This doc covers _how to build it in Flutter_: package choice, the one piece of code that's genuinely identical between the two apps (the socket connection), and a screen/widget breakdown per app.

**This doc doesn't prescribe either app's overall architecture.** State management (Provider/Riverpod/Bloc/GetX), the existing HTTP client (Dio/http), and DI setup are unknown from this repo — the skeletons below are written state-management-agnostic (plain classes + streams) so they drop into whichever pattern each app already uses. The only thing assumed is that both apps already have a working authenticated HTTP client and an existing FCM notification-tap handler for other features — chat reuses both, it doesn't introduce new ones.

---

## ⚠️ Read this first — a real bug this plan exists to prevent

A per-user socket connection cap (5 concurrent connections) was added server-side as an abuse guard (`apps/api/src/modules/chat/lib/socket-server.ts`). It's necessary — nothing else in the platform rate-limits chat — but it has a sharp edge: **if the Flutter app opens a new socket on every app-resume without properly closing the previous one, stale connections pile up, and once the count exceeds 5, the server force-disconnects the app's own current live connection** — chat silently stops receiving `chat:message` events with no error surfaced to the user.

The `ChatSocketService` skeleton below is written specifically to avoid this: one singleton instance, an idempotent `connect()` that's a no-op if already connected, and a `disconnect()` that's always called before creating a new socket. Follow this lifecycle exactly — don't call `IO.io(...)` more than once per app session without disposing the previous instance first.

---

## 1. Package

```yaml
dependencies:
  socket_io_client: ^2.0.0 # or whatever is current — must match socket.io v4 server compatibility
```

No new HTTP package — REST calls reuse each app's existing authenticated client (Dio/http), just pointed at the endpoints in the two integration docs.

---

## 2. Shared piece — `ChatSocketService`

This class is **byte-identical between the two apps** except for the base URL (same for both — same backend) and which token-getter it's wired to (each app already has its own logged-in user's token; the server infers `student` vs `blink_ambassador` from the JWT itself — see the earlier discussion in this thread on why one connection method serves both apps). Drop this file into both projects unchanged.

```dart
import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChatMessageEvent {
  final String conversationId;
  final String messageId;
  ChatMessageEvent({required this.conversationId, required this.messageId});

  factory ChatMessageEvent.fromJson(Map<String, dynamic> json) =>
      ChatMessageEvent(
        conversationId: json['conversationId'] as String,
        messageId: json['messageId'] as String,
      );
}

/// Singleton — connect once at app/session level right after login, not
/// per-screen. Screens subscribe to [messages] and dispose their own
/// subscription; they never call connect()/disconnect() themselves.
class ChatSocketService {
  ChatSocketService._();
  static final ChatSocketService instance = ChatSocketService._();

  IO.Socket? _socket;
  final _messageController = StreamController<ChatMessageEvent>.broadcast();

  /// Fires on every `chat:message` event. Broadcast stream — safe for
  /// multiple screens (inbox + an open chat screen) to listen at once.
  Stream<ChatMessageEvent> get messages => _messageController.stream;

  bool get isConnected => _socket?.connected ?? false;

  /// Idempotent — safe to call on every app resume / auth-state-changed
  /// event. Does nothing if a socket is already connected, so app-resume
  /// churn can never pile up extra connections and trip the server's
  /// per-user connection cap.
  void connect({
    required String baseUrl,
    required Future<String> Function() getAccessToken,
  }) {
    if (_socket != null) return; // already connected or connecting

    _socket = IO.io(
      baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth((cb) async {
            // Re-invoked on every (re)connect attempt, so a refreshed
            // token is always picked up automatically — never bake a
            // token string into setAuth() as a static Map.
            cb({'token': await getAccessToken()});
          })
          .build(),
    );

    _socket!.onConnect((_) {
      // log/telemetry here — a connected socket with nothing arriving is
      // the normal-looking failure mode; confirming connect actually
      // happened is the first thing to check when debugging "no messages".
    });

    _socket!.onConnectError((error) {
      // MUST be handled, not ignored — a silently swallowed connect_error
      // (bad/expired token, wrong userType, missing token) looks
      // identical to "socket connected but nothing arrives".
      // ignore: avoid_print
      print('Chat socket connect_error: $error');
    });

    _socket!.on('chat:message', (data) {
      _messageController.add(
        ChatMessageEvent.fromJson(Map<String, dynamic>.from(data as Map)),
      );
    });

    _socket!.connect();
  }

  /// Call before creating a new connection (e.g. logout, or a forced
  /// reconnect after token refresh) — never leave the old socket dangling
  /// while a new one is created, or stale connections accumulate toward
  /// the server's cap.
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  /// Wire this into whatever the app's existing auth layer calls when an
  /// access token is refreshed. Internally just disconnect+connect — the
  /// getAccessToken callback already re-reads the fresh token on the next
  /// connect, so this is the only integration point this plan needs into
  /// existing app code.
  void reconnect({
    required String baseUrl,
    required Future<String> Function() getAccessToken,
  }) {
    disconnect();
    connect(baseUrl: baseUrl, getAccessToken: getAccessToken);
  }
}
```

Call `ChatSocketService.instance.connect(...)` once, right after login succeeds (app startup if already logged in). Call `.disconnect()` on logout. Call `.reconnect(...)` from the existing token-refresh hook — that's it; nothing else in the app should touch socket connect/disconnect.

---

## 3. Shared models

Field names below match the two integration docs' JSON exactly — don't rename on the way in.

```dart
class ChatAttachment {
  final String url;
  final String? fileName;
  final String? mimeType;
  ChatAttachment({required this.url, this.fileName, this.mimeType});

  factory ChatAttachment.fromJson(Map<String, dynamic> json) => ChatAttachment(
        url: json['url'] as String,
        fileName: json['file_name'] as String?,
        mimeType: json['mime_type'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'url': url,
        if (fileName != null) 'file_name': fileName,
        if (mimeType != null) 'mime_type': mimeType,
      };
}

class ChatOtherParticipant {
  final String id;
  final String fullName;
  final String? avatarUrl;
  ChatOtherParticipant({required this.id, required this.fullName, this.avatarUrl});

  factory ChatOtherParticipant.fromJson(Map<String, dynamic> json) =>
      ChatOtherParticipant(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        avatarUrl: json['avatarUrl'] as String?,
      );
}

class ChatConversation {
  final String id;
  final ChatOtherParticipant otherParticipant;
  final String? lastMessageText;
  final DateTime? lastMessageAt;
  final int unreadCount;
  final String status;

  ChatConversation({
    required this.id,
    required this.otherParticipant,
    this.lastMessageText,
    this.lastMessageAt,
    required this.unreadCount,
    required this.status,
  });

  factory ChatConversation.fromJson(Map<String, dynamic> json) => ChatConversation(
        id: json['id'] as String,
        otherParticipant:
            ChatOtherParticipant.fromJson(json['otherParticipant'] as Map<String, dynamic>),
        lastMessageText: json['lastMessageText'] as String?,
        lastMessageAt: json['lastMessageAt'] != null
            ? DateTime.parse(json['lastMessageAt'] as String)
            : null,
        unreadCount: json['unreadCount'] as int,
        status: json['status'] as String,
      );
}

class ChatMessage {
  final String id;
  final String conversationId;
  final String senderType; // "student" | "blink_ambassador"
  final String senderId;
  final String? message;
  final List<ChatAttachment> attachments;
  final bool isRead;
  final DateTime? readAt;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderType,
    required this.senderId,
    this.message,
    required this.attachments,
    required this.isRead,
    this.readAt,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        id: json['id'] as String,
        conversationId: json['conversationId'] as String,
        senderType: json['senderType'] as String,
        senderId: json['senderId'] as String,
        message: json['message'] as String?,
        attachments: (json['attachments'] as List<dynamic>? ?? [])
            .map((a) => ChatAttachment.fromJson(a as Map<String, dynamic>))
            .toList(),
        isRead: json['isRead'] as bool,
        readAt: json['readAt'] != null ? DateTime.parse(json['readAt'] as String) : null,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}
```

Student app only — the ambassador-picker list item:

```dart
class ChatAmbassador {
  final String id;
  final String fullName;
  final String? phoneNumber;
  final String? avatarUrl;
  final String? campusCode;
  ChatAmbassador({
    required this.id,
    required this.fullName,
    this.phoneNumber,
    this.avatarUrl,
    this.campusCode,
  });

  factory ChatAmbassador.fromJson(Map<String, dynamic> json) => ChatAmbassador(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        phoneNumber: json['phoneNumber'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        campusCode: json['campusCode'] as String?,
      );
}
```

---

## 4. Per-app repository layer

Same method set, different base path and (student-only) extra methods. Wrap whichever HTTP client the app already uses — this is pseudocode for the method shapes, not a specific client's syntax:

**Student app** (`/api/v1/student/chat/*`):

```dart
class StudentChatRepository {
  Future<List<ChatAmbassador>> listAmbassadors(String collegeId);
  Future<ChatConversation> startConversation(String ambassadorId);
  Future<(List<ChatConversation>, int total)> listConversations({int page = 1, int limit = 20});
  Future<(List<ChatMessage>, int total)> getMessages(String conversationId, {int page = 1, int limit = 20});
  Future<ChatMessage> sendMessage(String conversationId, {String? message, List<ChatAttachment>? attachments});
  Future<void> markRead(String conversationId);
}
```

**Ambassador app** (`/api/v1/blink/ambassador/chat/*`) — same last 4 methods, no `listAmbassadors`/`startConversation`:

```dart
class AmbassadorChatRepository {
  Future<(List<ChatConversation>, int total)> listConversations({int page = 1, int limit = 20});
  Future<(List<ChatMessage>, int total)> getMessages(String conversationId, {int page = 1, int limit = 20});
  Future<ChatMessage> sendMessage(String conversationId, {String? message, List<ChatAttachment>? attachments});
  Future<void> markRead(String conversationId);
}
```

---

## 5. Screen breakdown

### BeaconU (student) app

| Screen             | Widgets                                                                                                                          | Data source                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Pick an Ambassador | List of ambassador cards (avatar/initials, name, campus code)                                                                    | `listAmbassadors(collegeId)`                                                                                        |
| → tap →            | (no screen — navigates directly)                                                                                                 | `startConversation(ambassadorId)` → push Chat screen with returned `id`                                             |
| Inbox              | List of conversation rows (avatar, name, last message preview, timestamp, unread badge)                                          | `listConversations()`; refresh on `ChatSocketService.instance.messages` events for conversations not currently open |
| Chat               | Paginated message list (load-more on scroll-to-top), composer (text field + attachment picker), send button disabled until valid | `getMessages()`, `sendMessage()`, `markRead()` on open                                                              |

### Blink (ambassador) app

| Screen | Widgets                                                                      | Data source                                            |
| ------ | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| Inbox  | Same row shape as the student app's inbox, `otherParticipant` is the student | `listConversations()`                                  |
| Chat   | Same as student app's Chat screen                                            | `getMessages()`, `sendMessage()`, `markRead()` on open |

**No third screen, no FAB, no "new message" route exists in this app's navigation graph at all** — a conversation only ever appears once a student has started it. Don't scaffold a compose screen "for later"; there's no endpoint for it to call.

---

## 6. Client-side validation (mirrors the server, doesn't replace it)

Applies to the composer in both apps' Chat screens:

```dart
bool canSend({String? message, List<ChatAttachment> attachments = const []}) {
  final hasMessage = message != null && message.trim().isNotEmpty;
  final hasAttachments = attachments.isNotEmpty;
  if (!hasMessage && !hasAttachments) return false;
  if (message != null && message.length > 4000) return false;
  if (attachments.length > 10) return false;
  if (attachments.any((a) => !a.url.startsWith('https://'))) return false;
  return true;
}
```

Show a character counter past ~3800 chars, cap the attachment picker at 10 selections, and only accept `https://` URLs back from the upload flow (reject before even attempting a send).

---

## 7. Push notification tap-through

Chat push payloads carry `data: { type: "chat_message", conversationId }`. Wire into whichever notification-tap handler each app already has for its other push types (e.g. a `switch` on `data['type']`): on `"chat_message"`, navigate to the Chat screen for `data['conversationId']`. No new FCM setup needed — `fcm_token` registration already happens at login on both sides (see the two integration docs).

---

## 8. Error handling

Small shared exception mapping, thrown by the repository layer on a non-2xx response:

```dart
class ChatApiException implements Exception {
  final int statusCode;
  final String message;
  ChatApiException(this.statusCode, this.message);
}
```

| Status | Meaning                                                     | UI                                                     |
| ------ | ----------------------------------------------------------- | ------------------------------------------------------ |
| `404`  | Conversation/ambassador not found or not yours              | Generic "not found" state, navigate back to inbox      |
| `400`  | Validation failure (should be prevented client-side per §6) | Inline field error — defensive fallback only           |
| `429`  | Rate-limited (>30 messages/60s)                             | Snackbar: "Sending too quickly — please wait a moment" |

---

## 9. Verification

1. Connect the socket on login in a test build of each app; confirm `onConnect` fires and `onConnectError` does NOT fire with a valid token.
2. Background/foreground the app 6+ times in a row without the fix in §2 in place (temporarily call `IO.io(...)` fresh each resume) — confirm you can reproduce the connection-cap disconnect from the server logs; then confirm the singleton/idempotent `connect()` above prevents it.
3. Send a message from the student app while the ambassador app is foregrounded on its Inbox screen (not the Chat screen) — confirm the inbox row updates live via the `messages` stream, not just on manual refresh.
4. Send a message from the ambassador app while the student app is backgrounded — confirm the push notification arrives and tapping it opens the correct conversation.
5. Attempt to send 31 messages in under 60 seconds from either app — confirm the 31st shows the rate-limit snackbar.
