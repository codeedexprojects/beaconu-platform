import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/my/", "/login", "/register"],
      },
    ],
    sitemap: "https://beaconu.com/sitemap.xml",
  };
}
