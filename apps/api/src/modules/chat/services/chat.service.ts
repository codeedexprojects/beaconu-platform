import { NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { BlinkService } from "@/modules/blink/services/blink.service";
import { PushService } from "@/modules/notifications/services/push.service";
import { emitChatMessage } from "../lib/socket-server";
import { assertChatMessageRateLimit } from "../lib/rate-limit";
import { ChatRepository } from "../repositories/chat.repository";
import type { SendMessageInput } from "../validators/chat.validator";

type ChatUserType = "student" | "blink_ambassador";

type ConversationRow = Awaited<
  ReturnType<typeof ChatRepository.findConversationById>
>;

/** Given which side the caller is on, resolves the *other* participant's
 * type/id/unread-count off a conversation row — one place for this
 * derivation instead of it being repeated (and risking drifting out of
 * sync) everywhere a conversation-list row is processed. */
function otherParticipantOf(
  userType: ChatUserType,
  row: NonNullable<ConversationRow>,
): { otherType: ChatUserType; otherId: string; unreadCount: number } {
  const isCallerParticipant1 = userType === "student";
  return {
    otherType: (isCallerParticipant1
      ? row.participant2Type
      : row.participant1Type) as ChatUserType,
    otherId: isCallerParticipant1 ? row.participant2Id : row.participant1Id,
    unreadCount: isCallerParticipant1
      ? row.participant1Unread
      : row.participant2Unread,
  };
}

function assertParticipant(
  conversation: NonNullable<ConversationRow>,
  userType: ChatUserType,
  userId: string,
): {
  mySlot: "participant1" | "participant2";
  otherType: ChatUserType;
  otherId: string;
} {
  if (
    conversation.participant1Type === userType &&
    conversation.participant1Id === userId
  ) {
    return {
      mySlot: "participant1",
      otherType: conversation.participant2Type as ChatUserType,
      otherId: conversation.participant2Id,
    };
  }
  if (
    conversation.participant2Type === userType &&
    conversation.participant2Id === userId
  ) {
    return {
      mySlot: "participant2",
      otherType: conversation.participant1Type as ChatUserType,
      otherId: conversation.participant1Id,
    };
  }
  throw new NotFoundError("Conversation not found");
}

async function loadConversationForParticipant(
  conversationId: string,
  userType: ChatUserType,
  userId: string,
) {
  const conversation =
    await ChatRepository.findConversationById(conversationId);
  if (!conversation) throw new NotFoundError("Conversation not found");
  const membership = assertParticipant(conversation, userType, userId);
  return { conversation, ...membership };
}

async function notifyNewMessage(
  recipientType: ChatUserType,
  recipientId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string,
  messageId: string,
): Promise<void> {
  // Both the socket emit and the push send are best-effort — a synchronous
  // throw from either must never escape this function, since callers invoke
  // it as `void notifyNewMessage(...)` with no .catch of their own.
  try {
    emitChatMessage(recipientType, recipientId, {
      conversationId,
      messageId,
    });
  } catch (error) {
    logger.error(
      { err: error, conversationId },
      "Failed to emit chat message socket event",
    );
  }
  try {
    await PushService.sendToUser(recipientId, recipientType, {
      title: senderName,
      body: messagePreview,
      data: { type: "chat_message", conversationId },
    });
  } catch (error) {
    logger.error(
      { err: error, conversationId },
      "Failed to send chat message push notification",
    );
  }
}

export class ChatService {
  static async listAmbassadorsForCollege(collegeId: string) {
    return BlinkService.listActiveAmbassadorsForCollege(collegeId);
  }

  static async startOrGetConversation(studentId: string, ambassadorId: string) {
    await BlinkService.assertActiveAmbassador(ambassadorId);
    return ChatRepository.upsertConversation(studentId, ambassadorId);
  }

  static async listConversations(
    userType: ChatUserType,
    userId: string,
    page: number,
    limit: number,
  ) {
    const { rows, total } = await ChatRepository.listConversationsForUser(
      userType,
      userId,
      page,
      limit,
    );

    const others = rows.map((row) => otherParticipantOf(userType, row));

    const studentIds = new Set<string>();
    const ambassadorIds = new Set<string>();
    for (const { otherType, otherId } of others) {
      if (otherType === "student") studentIds.add(otherId);
      else ambassadorIds.add(otherId);
    }

    const [students, ambassadors] = await Promise.all([
      studentIds.size
        ? ChatRepository.findStudentDisplayInfo([...studentIds])
        : Promise.resolve([]),
      ambassadorIds.size
        ? ChatRepository.findAmbassadorDisplayInfo([...ambassadorIds])
        : Promise.resolve([]),
    ]);
    const studentById = new Map(students.map((s) => [s.id, s]));
    const ambassadorById = new Map(ambassadors.map((a) => [a.id, a]));

    const conversations = rows.map((row, i) => {
      const { otherType, otherId, unreadCount } = others[i]!;
      const other =
        otherType === "student"
          ? studentById.get(otherId)
          : ambassadorById.get(otherId);

      return {
        id: row.id,
        otherParticipant: {
          id: otherId,
          fullName: other?.fullName ?? "Unknown",
          avatarUrl: other?.avatarUrl ?? null,
        },
        lastMessageText: row.lastMessageText,
        lastMessageAt: row.lastMessageAt
          ? row.lastMessageAt.toISOString()
          : null,
        unreadCount,
        status: row.status,
      };
    });

    return { conversations, total };
  }

  static async getMessages(
    userType: ChatUserType,
    userId: string,
    conversationId: string,
    page: number,
    limit: number,
  ) {
    await loadConversationForParticipant(conversationId, userType, userId);
    const { rows, total } = await ChatRepository.listMessages(
      conversationId,
      page,
      limit,
    );
    return {
      messages: rows.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderType: m.senderType,
        senderId: m.senderId,
        message: m.message,
        attachments: m.attachments,
        isRead: m.isRead,
        readAt: m.readAt ? m.readAt.toISOString() : null,
        createdAt: m.createdAt.toISOString(),
      })),
      total,
    };
  }

  static async sendMessage(
    userType: ChatUserType,
    userId: string,
    conversationId: string,
    data: SendMessageInput,
  ) {
    await assertChatMessageRateLimit(userType, userId);
    const { mySlot, otherType, otherId } = await loadConversationForParticipant(
      conversationId,
      userType,
      userId,
    );
    const recipientSlot =
      mySlot === "participant1" ? "participant2" : "participant1";
    const previewText = data.message ?? "Sent an attachment";

    // Independent of each other — the sender's display name is only
    // needed for the push notification sent after both resolve, not for
    // persisting the message itself.
    const [senderDisplay, message] = await Promise.all([
      userType === "student"
        ? ChatRepository.findStudentDisplayInfo([userId])
        : ChatRepository.findAmbassadorDisplayInfo([userId]),
      ChatRepository.createMessage(
        conversationId,
        userType,
        userId,
        data.message ?? null,
        data.attachments ?? [],
        recipientSlot,
        previewText,
      ),
    ]);
    const senderName = senderDisplay[0]?.fullName ?? "New message";

    // Fire-and-forget — notifyNewMessage already catches and logs its own
    // failures internally (the push send is best-effort by design), so
    // awaiting it here would only add external network latency to every
    // message send for no correctness benefit.
    notifyNewMessage(
      otherType,
      otherId,
      senderName,
      previewText,
      conversationId,
      message.id,
    ).catch((error: unknown) => {
      // Defense in depth on top of notifyNewMessage's own internal
      // try/catch — guarantees this fire-and-forget call can never surface
      // as an unhandled promise rejection, regardless of what changes
      // inside that function later.
      logger.error(
        { err: error, conversationId },
        "Unexpected failure in chat notification pipeline",
      );
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderType: message.senderType,
      senderId: message.senderId,
      message: message.message,
      attachments: message.attachments,
      isRead: message.isRead,
      readAt: message.readAt ? message.readAt.toISOString() : null,
      createdAt: message.createdAt.toISOString(),
    };
  }

  static async markRead(
    userType: ChatUserType,
    userId: string,
    conversationId: string,
  ) {
    const { mySlot } = await loadConversationForParticipant(
      conversationId,
      userType,
      userId,
    );
    await ChatRepository.markRead(conversationId, mySlot);
  }
}
