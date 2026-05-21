import { prisma } from "@beaconu/db";
import type { Prisma } from "@beaconu/db";
import { ForbiddenError, NotFoundError } from "@/shared/errors";
import { generateSlug } from "@/shared/utils";
import { BlogRepository } from "../repositories/blogs.repository";
import { BlogQuery } from "../queries/blogs.query";
import {
  SubmitBlogInput,
  UpdateBlogInput,
} from "../validators/blogs.validator";

async function resolveAuthorName(
  authorId: string,
  authorType: string,
): Promise<string> {
  switch (authorType) {
    case "student": {
      const record = await prisma.student.findUnique({
        where: { id: authorId },
        select: { fullName: true },
      });
      if (!record) throw new NotFoundError("Student not found");
      return record.fullName;
    }
    case "counsellor": {
      const record = await prisma.counsellor.findUnique({
        where: { id: authorId },
        select: { fullName: true },
      });
      if (!record) throw new NotFoundError("Counsellor not found");
      return record.fullName;
    }
    case "staff_member": {
      const record = await prisma.staffMember.findUnique({
        where: { id: authorId },
        select: { fullName: true },
      });
      if (!record) throw new NotFoundError("Staff member not found");
      return record.fullName;
    }
    case "platform_admin": {
      const record = await prisma.platformAdmin.findUnique({
        where: { id: authorId },
        select: { fullName: true },
      });
      if (!record) throw new NotFoundError("Admin not found");
      return record.fullName;
    }
    case "blog_author": {
      const record = await prisma.blogAuthor.findUnique({
        where: { id: authorId },
        select: { fullName: true },
      });
      if (!record) throw new NotFoundError("Blog author not found");
      return record.fullName;
    }
    default:
      throw new NotFoundError("Unknown author type");
  }
}

async function generateUniqueSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = generateSlug(title);
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await BlogRepository.findBySlug(candidate);
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
}

export class BlogService {
  static async submit(
    data: SubmitBlogInput,
    authorId: string,
    authorType: string,
  ) {
    const authorName = await resolveAuthorName(authorId, authorType);
    const slug = await generateUniqueSlug(data.title);
    const isPlatformAdmin = authorType === "platform_admin";

    return BlogRepository.create({
      title: data.title,
      slug,
      summary: data.summary ?? null,
      content: data.content,
      coverImageUrl: data.cover_image_url ?? null,
      tags: data.tags as Prisma.InputJsonValue,
      authorId,
      authorType,
      authorName,
      status: isPlatformAdmin ? "approved" : "pending",
      publishedAt: isPlatformAdmin ? new Date() : null,
    });
  }

  static async update(id: string, authorId: string, data: UpdateBlogInput) {
    const existing = await BlogRepository.findById(id);
    if (!existing) throw new NotFoundError("Blog not found");
    if (existing.authorId !== authorId)
      throw new ForbiddenError("Not authorized to edit this blog");
    if (existing.status !== "pending")
      throw new ForbiddenError("Only pending blogs can be edited");

    let slug: string | undefined;
    if (data.title !== undefined && data.title !== existing.title) {
      slug = await generateUniqueSlug(data.title, id);
    }

    return BlogRepository.updateById(id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(slug !== undefined ? { slug } : {}),
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

  static async unpublish(id: string) {
    const existing = await BlogRepository.findById(id);
    if (!existing) throw new NotFoundError("Blog not found");
    if (existing.status !== "approved")
      throw new ForbiddenError("Only approved blogs can be unpublished");

    return BlogRepository.updateById(id, {
      status: "pending",
      publishedAt: null,
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
