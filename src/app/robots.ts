import type { MetadataRoute } from "next"
import { getAppUrl } from "@/lib/app-url"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAppUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api", "/login", "/register"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
