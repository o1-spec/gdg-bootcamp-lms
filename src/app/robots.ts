import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/join", "/forgot-password", "/reset-password"],
        disallow: [
          "/admin",
          "/admin/*",
          "/mentor",
          "/mentor/*",
          "/tracks",
          "/tracks/*",
          "/assignments",
          "/assignments/*",
          "/resources",
          "/resources/*",
          "/schedule",
          "/progress",
          "/attendance",
          "/announcements",
          "/notifications",
          "/settings",
          "/settings/*",
          "/profile",
          "/onboarding",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
