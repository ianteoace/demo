import Link from "next/link"

import EmptyState from "@/components/public/empty-state"
import PropertyCard from "@/components/public/property-card"
import { Card, Container, PageHeader, Section } from "@/components/ui"
import {
  getBusinessContact,
  getGmailComposeHref,
  getPhoneHref,
  getWhatsAppHref,
} from "@/lib/business-contact"
import { prisma } from "@/lib/prisma"
import type { PropertyWithImages } from "@/types/property"

const FEATURED_LIMIT = 6

async function getFeaturedProperties(): Promise<{
  properties: PropertyWithImages[]
  usedFallback: boolean
}> {
  const featured = await prisma.property.findMany({
    where: {
      published: true,
      featured: true,
    },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: FEATURED_LIMIT,
  })

  if (featured.length > 0) {
    return {
      properties: featured,
      usedFallback: false,
    }
  }

  const recent = await prisma.property.findMany({
    where: { published: true },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: FEATURED_LIMIT,
  })

  return {
    properties: recent,
    usedFallback: true,
  }
}

export default async function Home() {
  const { properties, usedFallback } = await getFeaturedProperties()
  const contact = getBusinessContact()
  const whatsappHref = getWhatsAppHref(contact.whatsappNumber)
  const phoneHref = getPhoneHref(contact.phone)
  const emailHref = contact.email ? getGmailComposeHref(contact.email) : null

  return (
    <main className="py-8 md:py-12">
      <Container size="public">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-[linear-gradient(125deg,#f6f7f8_0%,#edf0f4_45%,#ffffff_100%)] px-6 py-10 md:px-12 md:py-16 lg:px-16 xl:px-20">
          <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-zinc-300/20 blur-3xl" />
          <div className="absolute -bottom-20 left-16 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <PageHeader
              eyebrow="Mercado inmobiliario"
              title="Propiedades para vivir, invertir y proyectar tu próxima etapa."
              description="Seleccionamos oportunidades en venta y alquiler con acompañamiento comercial en cada decisión clave."
              actions={
                <>
                  <Link
                    href="/propiedades"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-700"
                  >
                    Ver propiedades
                  </Link>
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-6 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Contactar por WhatsApp
                    </a>
                  ) : null}
                </>
              }
            />
            <Card className="bg-white/80 p-5 backdrop-blur md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Atención comercial
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Equipo especializado en compra, venta y alquiler residencial con seguimiento
                comercial personalizado.
              </p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950">+200</p>
              <p className="text-sm text-zinc-500">consultas calificadas gestionadas</p>
            </Card>
          </div>
        </section>

        <Section
          id="destacadas"
          className="scroll-mt-24"
          title="Propiedades destacadas"
          description={
            usedFallback
              ? "No hay destacadas activas. Te mostramos las publicaciones más recientes."
              : "Una selección de oportunidades destacadas del portfolio actual."
          }
          actions={
            <Link
              href="/propiedades"
              className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Ver todas
            </Link>
          }
        >
          {properties.length === 0 ? (
            <EmptyState
              title="Todavía no hay publicaciones visibles"
              description="Cuando activemos nuevas publicaciones, las vas a ver aquí con precio, ubicación y características."
              note="Mientras tanto, puedes explorar el listado completo y contactarnos por WhatsApp."
              actionLabel="Explorar listado"
              actionHref="/propiedades"
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </Section>

        <Section
          id="servicios"
          className="scroll-mt-24 rounded-3xl border border-zinc-200 bg-white p-6 md:p-8"
          title="Soluciones para cada etapa"
          description="Acompañamos operaciones residenciales y de inversión con procesos claros y eficientes."
          compact
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-zinc-50 p-5">
              <h3 className="text-lg font-semibold text-zinc-900">Compra</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Encontramos opciones alineadas a tu perfil y negociamos con foco en seguridad y
                valor.
              </p>
            </Card>
            <Card className="bg-zinc-50 p-5">
              <h3 className="text-lg font-semibold text-zinc-900">Venta</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Posicionamos tu propiedad con estrategia comercial, imagen profesional y seguimiento
                de interesados.
              </p>
            </Card>
            <Card className="bg-zinc-50 p-5">
              <h3 className="text-lg font-semibold text-zinc-900">Alquiler</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Gestionamos publicaciones, consultas y selección de inquilinos para reducir vacancia
                y riesgos.
              </p>
            </Card>
          </div>
        </Section>

        <Section
          id="contacto"
          className="scroll-mt-24 rounded-3xl border border-zinc-200 bg-zinc-950 p-6 text-zinc-50 md:p-8"
          title="Publica tu propiedad con foco comercial"
          description="Un proceso simple para salir al mercado con material profesional y trazabilidad de contactos."
          compact
          actions={
            <Link
              href="/propiedades"
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
            >
              Explorar portfolio
            </Link>
          }
        >
          <div className="mb-5 flex flex-wrap gap-2">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500"
              >
                WhatsApp
              </a>
            ) : null}
            {phoneHref && contact.phone ? (
              <a
                href={phoneHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500"
              >
                Celular: {contact.phone}
              </a>
            ) : null}
            {emailHref && contact.email ? (
              <a
                href={emailHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500"
              >
                Email: {contact.email}
              </a>
            ) : null}
          </div>

          <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
            Coordinamos estrategia de precio, posicionamiento y gestión de consultas para que la
            operación avance con información clara y decisiones más seguras.
          </p>
        </Section>
      </Container>
    </main>
  )
}
