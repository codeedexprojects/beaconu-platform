import { prisma, Prisma } from "@beaconu/db";

const STUDENT_TYPE = "student";
const AMBASSADOR_TYPE = "blink_ambassador";

const CONVERSATION_SELECT = {
  id: true,
  participant1Type: true,
  participant1Id: true,
  participant2Type: true,
  participant2Id: true,
  lastMessageText: true,
  lastMessageAt: true,
  participant1Unread: true,
  participant2Unread: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ChatConversationSelect;

const MESSAGE_SELECT = {
  id: true,
  conversationId: true,
  senderType: true,
  senderId: true,
  message: true,
  attachments: true,
  isRead: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.ChatMessageSelect;

export class ChatRepository {
  /** Every conversation this module creates always stores the student as
   * participant1 and the ambassador as participant2 — never swapped — so
   * this is the only lookup shape ever needed against the unique
   * constraint (see Plan AH, Design Decision #1).
   *
   * IMPORTANT: `uq_conversation_pair` is a plain 4-column tuple unique
   * index — it does NOT itself enforce canonical ordering. A row inserted
   * with the pair swapped (ambassador as participant1, student as
   * participant2) would NOT collide with an existing normal-order row,
   * silently creating a second parallel conversation for the same pair.
   * This is exactly why `upsertConversation` below must stay the *only*
   * place in this codebase that ever creates a `ChatConversation` row — if
   * a future feature needs a second write path (e.g. ambassador-initiated
   * conversations), it must call this same method, never insert directly.
   *
   * `upsert`, not `create` — two concurrent "start conversation" requests
   * for the same (student, ambassador) pair (double-tap, retry, two tabs)
   * must both resolve to the exact same row, never a unique-constraint
   * error on the loser. `update: {}` is a deliberate no-op: the point of
   * the upsert is the atomic conflict handling, not changing anything on
   * an existing conversation. */
  static async upsertConversation(studentId: string, ambassadorId: string) {
    return prisma.chatConversation.upsert({
      where: {
        uq_conversation_pair: {
          participant1Type: STUDENT_TYPE,
          participant1Id: studentId,
          participant2Type: AMBASSADOR_TYPE,
          participant2Id: ambassadorId,
        },
      },
      create: {
        participant1Type: STUDENT_TYPE,
        participant1Id: studentId,
        participant2Type: AMBASSADOR_TYPE,
        participant2Id: ambassadorId,
      },
      update: {},
      select: CONVERSATION_SELECT,
    });
  }

  static async findConversationById(id: string) {
    return prisma.chatConversation.findUnique({
      where: { id },
      select: CONVERSATION_SELECT,
    });
  }

  static async listConversationsForUser(
    userType: "student" | "blink_ambassador",
    userId: string,
    page: number,
    limit: number,
  ) {
    const where: Prisma.ChatConversationWhereInput =
      userType === STUDENT_TYPE
        ? { participant1Type: STUDENT_TYPE, participant1Id: userId }
        : { participant2Type: AMBASSADOR_TYPE, participant2Id: userId };

    const skip = (page - 1) * limit;
    const [rows, total] = await prisma.$transaction([
      prisma.chatConversation.findMany({
        where,
        select: CONVERSATION_SELECT,
        // A freshly-created conversation has no messages yet (lastMessageAt
        // is null) — nulls last keeps it from outranking genuinely recent
        // activity, since Postgres's default for DESC is NULLS FIRST. `id`
        // is a secondary sort so paginated skip/take stays stable when two
        // rows share the same lastMessageAt.
        orderBy: [
          { lastMessageAt: { sort: "desc", nulls: "last" } },
          { id: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.chatConversation.count({ where }),
    ]);
    return { rows, total };
  }

  static async findStudentDisplayInfo(studentIds: string[]) {
    return prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, fullName: true, avatarUrl: true },
    });
  }

  static async findAmbassadorDisplayInfo(ambassadorIds: string[]) {
    return prisma.blinkUser.findMany({
      where: { id: { in: ambassadorIds } },
      select: { id: true, fullName: true, avatarUrl: true },
    });
  }

  static async listMessages(
    conversationId: string,
    page: number,
    limit: number,
  ) {
    const where: Prisma.ChatMessageWhereInput = { conversationId };
    const skip = (page - 1) * limit;
    const [rows, total] = await prisma.$transaction([
      prisma.chatMessage.findMany({
        where,
        select: MESSAGE_SELECT,
        // `id` tiebreaker keeps pagination stable when two messages share
        // the same createdAt timestamp (millisecond collisions under a
        // fast burst of sends).
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({ where }),
    ]);
    return { rows, total };
  }

  /** Persists the message, bumps the conversation's last-message preview,
   * and increments the *recipient's* unread counter — one transaction so a
   * message can never exist without its conversation preview/counter
   * reflecting it. */
  static async createMessage(
    conversationId: string,
    senderType: "student" | "blink_ambassador",
    senderId: string,
    message: string | null,
    attachments: Prisma.InputJsonValue,
    recipientSlot: "participant1" | "participant2",
    previewText: string,
  ) {
    const unreadField =
      recipientSlot === "participant1"
        ? "participant1Unread"
        : "participant2Unread";

    const [created] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          conversationId,
          senderType,
          senderId,
          message,
          attachments,
        },
        select: MESSAGE_SELECT,
      }),
      prisma.chatConversation.update({
        where: { id: conversationId },
        data: {
          // The conversation preview always gets a real string — even for
          // an attachment-only message, where `message` itself is null —
          // separate from `previewText`'s own use in the push notification.
          lastMessageText: previewText,
          lastMessageAt: new Date(),
          [unreadField]: { increment: 1 },
        },
      }),
    ]);
    return created;
  }

  static async markRead(
    conversationId: string,
    participantSlot: "participant1" | "participant2",
  ) {
    const unreadField =
      participantSlot === "participant1"
        ? "participant1Unread"
        : "participant2Unread";
    // The reader's own sent messages aren't touched — only messages sent by
    // the *other* participant count as "unread by me".
    const otherSenderType =
      participantSlot === "participant1" ? AMBASSADOR_TYPE : STUDENT_TYPE;

    await prisma.$transaction([
      prisma.chatConversation.update({
        where: { id: conversationId },
        data: { [unreadField]: 0 },
      }),
      prisma.chatMessage.updateMany({
        where: { conversationId, senderType: otherSenderType, isRead: false },
        data: { isRead: true, readAt: new Date() },
      }),
    ]);
  }
}
