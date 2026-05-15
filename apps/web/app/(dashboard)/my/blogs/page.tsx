import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BLOG_TOKEN_KEY } from "@/lib/constants";
import { MyBlogsList } from "@/components/blogs/MyBlogsList";

export default async function MyBlogsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(BLOG_TOKEN_KEY)?.value;

  if (!token) redirect("/login");

  return <MyBlogsList userType="blog_author" />;
}
