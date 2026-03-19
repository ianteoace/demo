import type { Metadata } from "next"

import { Providers } from "./providers"
import "./globals.css"

import { getAuthSession } from "@/auth"
import { getAppUrl } from "@/lib/app-url"

const siteUrl = getAppUrl()
const metadataBase = new URL(siteUrl)

export const metadata: Metadata = {
  metadataBase,
  applicationName: "SoloAderezos",
  title: {
    default: "SoloAderezos",
    template: "%s | SoloAderezos",
  },
  description:
    "Distribuidora mayorista de aderezos para gastronomia, comercios y revendedores. Catalogo por volumen, carrito de pedidos y atencion comercial por WhatsApp.",
  keywords: [
    "SoloAderezos",
    "aderezos mayoristas",
    "distribuidora de aderezos",
    "catalogo mayorista",
    "proveedor gastronomico",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "SoloAderezos",
    title: "SoloAderezos",
    description:
      "Catalogo mayorista de aderezos para compra por volumen y gestion de pedidos comerciales.",
    url: "/",
    images: [
      {
        url: "/soloaderezos-logo.svg",
        alt: "Logo SoloAderezos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoloAderezos",
    description:
      "Distribuidora mayorista de aderezos con catalogo comercial y flujo simple de pedidos.",
    images: ["/soloaderezos-logo.svg"],
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
      <body className="antialiased">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
