import type { Metadata } from "next"

import { Providers } from "./providers"
import "./globals.css"

import { getAuthSession } from "@/auth"
import { getAppUrl } from "@/lib/app-url"

const siteUrl = getAppUrl()
const metadataBase = new URL(siteUrl)

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Inmobiliaria | Propiedades en venta y alquiler",
    template: "%s | Inmobiliaria",
  },
  description:
    "Portal inmobiliario para explorar propiedades en venta y alquiler, con fichas completas y contacto comercial directo.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Inmobiliaria",
    title: "Inmobiliaria | Propiedades en venta y alquiler",
    description:
      "Explora propiedades destacadas, filtra por ubicacion y contacta al equipo comercial desde un portal inmobiliario profesional.",
    url: "/",
    images: [
      {
        url: "/next.svg",
        width: 1200,
        height: 630,
        alt: "Inmobiliaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inmobiliaria | Propiedades en venta y alquiler",
    description:
      "Explora propiedades destacadas y contacta al equipo comercial desde el portal inmobiliario.",
    images: ["/next.svg"],
  },
}

// layouts in the App router can be async.  we fetch the session once on the
// server and forward it to the client provider to avoid tearing and unnecessary
// additional requests.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()

  return (
    <html lang="es">
      <body className="bg-zinc-100 text-zinc-900 antialiased">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
