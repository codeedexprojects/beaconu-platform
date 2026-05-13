import type { Prisma } from "@beaconu/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors";
import { BlogRepository } from "../repositories/blogs.repository";
import { BlogQuery } from "../queries/blogs.query";
import {
  SubmitBlogInput,
  UpdateBlogInput,
} from "../validators/blogs.validator";

export class BlogService {
  static async submit(
    data: SubmitBlogInput,
    authorId: string,
    authorType: string,
  ) {
    const existingSlug = await BlogRepository.findBySlug(data.slug);
    if (existingSlug) throw new ConflictError("Blog slug already exists");

    return BlogRepository.create({
      title: data.title,
      slug: data.slug,
      summary: data.summary ?? null,
      content: data.content,
      coverImageUrl: data.cover_image_url ?? null,
      tags: data.tags as Prisma.InputJsonValue,
      authorId,
      authorType,
      authorName: data.author_name,
    });
  }

  static async update(id: string, authorId: string, data: UpdateBlogInput) {
    const existing = await BlogRepository.findById(id);
    if (!existing) throw new NotFoundError("Blog not found");
    if (existing.authorId !== authorId)
      throw new ForbiddenError("Not authorized to edit this blog");
    if (existing.status !== "pending")
      throw new ForbiddenError("Only pending blogs can be edited");

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await BlogRepository.findBySlug(data.slug);
      if (slugTaken) throw new ConflictError("Blog slug already exists");
    }

    return BlogRepository.updateById(id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.cover_image_url !== undefined
        ? { coverImageUrl: data.cover_image_url }
        : {}),
      ...(data.tags !== undefined
        ? { tags: data.tags as Prisma.InputJsonValue }
        : {}),
    });
  }

  static async approve(id: string, reviewedBy: string) {
    const existing = await BlogRepository.findById(id);
    if (!existing) throw new NotFoundError("Blog not found");
    if (existing.status !== "pending")
      throw new ForbiddenError("Only pending blogs can be approved");

    return BlogRepository.updateById(id, {
      status: "approved",
      reviewedBy,
      reviewedAt: new Date(),
      publishedAt: new Date(),
      rejectionReason: null,
    });
  }

  static async reject(id: string, reviewedBy: string, rejectionReason: string) {
    const existing = await BlogRepository.findById(id);
    if (!existing) throw new NotFoundError("Blog not found");
    if (existing.status !== "pending")
      throw new ForbiddenError("Only pending blogs can be rejected");

    return BlogRepository.updateById(id, {
      status: "rejected",
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason,
    });
  }

  static async getPublishedBySlug(slug: string) {
    const blog = await BlogRepository.findBySlug(slug);
    if (!blog || blog.status !== "approved")
      throw new NotFoundError("Blog not found");

    await BlogRepository.incrementViewCount(blog.id);
    return blog;
  }

  static async getOwnBlog(id: string, authorId: string) {
    const blog = await BlogQuery.getById(id);
    if (blog.authorId !== authorId)
      throw new ForbiddenError("Not authorized to view this blog");
    return blog;
  }
}
