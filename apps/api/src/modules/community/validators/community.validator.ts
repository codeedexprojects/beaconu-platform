import z from "zod";

export const CommunitySchema = {
  create: z.object({
    name: z.string().trim().min(2).max(255),
    description: z.string().trim().max(2000).optional(),
    iconUrl: z.string().trim().url().optional(),

    coverImageUrl: z.string().trim().url().optional(),
  }),

  update: z.object({
    name: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    iconUrl: z.string().trim().url().nullable().optional(),
    coverImageUrl: z.string().trim().url().nullable().optional(),
  }),

  listQuery: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    search: z.string().trim().max(255).optional(),
  }),

  adminListQuery: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(["active", "disabled"]).optional(),
  }),
  idParam: z.object({
    id: z.string().min(1),
  }),

  postDeleteParam: z.object({
    id: z.string().min(1),
    postId: z.string().min(1),
  }),

  commentDeleteParam: z.object({
    id: z.string().min(1),
    postId: z.string().min(1),
    commentId: z.string().min(1),
  }),

  createPost: z.object({
    content: z.string().trim().min(1).max(5000),
    attachments: z.array(z.string().trim().url()).max(10).optional(),
  }),

  createComment: z.object({
    content: z.string().trim().min(1).max(2000),
  }),
};
export type CreateCommunityInput = z.infer<typeof CommunitySchema.create>;
export type UpdateCommunityInput = z.infer<typeof CommunitySchema.update>;
export type ListCommunitiesQuery = z.infer<typeof CommunitySchema.listQuery>;
export type ListCommunityPostsQuery = z.infer<typeof CommunitySchema.listQuery>;
export type AdminListCommunitiesQuery = z.infer<
  typeof CommunitySchema.adminListQuery
>;
export type DeleteCommunityPostParam = z.infer<
  typeof CommunitySchema.postDeleteParam
>;
export type DeleteCommunityCommentParam = z.infer<
  typeof CommunitySchema.commentDeleteParam
>;
export type CreateCommunityPostInput = z.infer<
  typeof CommunitySchema.createPost
>;
export type CreateCommunityCommentInput = z.infer<
  typeof CommunitySchema.createComment
>;
