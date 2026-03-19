import type { MetadataRoute } from "next"
import { getAppUrl } from "@/lib/app-url"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAppUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/api",
          "/login",
          "/register",
          "/activar-acceso",
          "/checkout",
          "/carrito",
          "/debug",
        ],
      },
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
