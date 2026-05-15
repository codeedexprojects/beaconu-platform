import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BLOG_TOKEN_KEY } from "@/lib/constants";
import { BlogSubmitForm } from "@/components/blogs/BlogSubmitForm";

export default async function NewBlogPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(BLOG_TOKEN_KEY)?.value;

  if (!token) redirect("/login");

  return <BlogSubmitForm userType="blog_author" />;
}
