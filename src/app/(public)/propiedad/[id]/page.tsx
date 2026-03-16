import type { Metadata } from "next"
import type { Prisma } from "@prisma/client"
import { cache } from "react"
import { notFound, redirect } from "next/navigation"

import EmptyState from "@/components/public/empty-state"
import Breadcrumbs from "@/components/public/breadcrumbs"
import PropertyFeatures from "@/components/public/property-features"
import StatusBadge from "@/components/public/status-badge"
import { Card, Container } from "@/components/ui"
import { getAppUrl } from "@/lib/app-url"
import {
  getBusinessContact,
  getGmailComposeHref,
  getPhoneHref,
  getWhatsAppHref,
} from "@/lib/business-contact"
import { getOperationTypeLabel } from "@/lib/property-operation-type"
import { buildPropertyFeatureSections } from "@/lib/property-feature-sections"
import { formatPropertyPrice } from "@/lib/property-price"
import { getPropertyTypeLabel } from "@/lib/property-type"
import { buildOpenStreetMapEmbedUrl, geocodeAddressWithOsm } from "@/lib/osm-geocoding"
import { prisma } from "@/lib/prisma"

import LeadForm from "./lead-form"

type PublicPropertyDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

type PublicPropertyDetail = Prisma.PropertyGetPayload<{
  include: {
    images: true
    propertyFeatures: true
  }
}>

const propertyDetailInclude = {
  images: {
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  },
  propertyFeatures: {
    orderBy: [{ category: "asc" }, { key: "asc" }],
  },
} satisfies Prisma.PropertyInclude

async function getProperty(id: string): Promise<PublicPropertyDetail | null> {
  const bySlug = await prisma.property.findUnique({
    where: { slug: id },
    include: propertyDetailInclude,
  })

  if (bySlug && bySlug.published) {
    return bySlug
  }

  return prisma.property.findFirst({
    where: {
      id,
      published: true,
    },
    include: propertyDetailInclude,
  })
}

const getCachedProperty = cache(getProperty)

export async function generateMetadata({
  params,
}: PublicPropertyDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const property = await getCachedProperty(id)

  if (!property) {
    return {
      title: "Propiedad no encontrada",
      description: "La propiedad solicitada no existe o ya no está disponible.",
    }
  }

  const title = `${property.title} en ${property.city}`
  const description =
    property.description?.trim() ||
    `${property.title} ubicada en ${property.city}. Precio: ${formatPropertyPrice(property.price, property.currency)}.`
  const firstImage = property.images[0]
  const imageUrl = firstImage?.url
  const siteUrl = getAppUrl()
  const pageUrl = `${siteUrl}/propiedad/${property.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: property.title,
            },
          ]
        : [],
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function PublicPropertyDetailPage({
  params,
}: PublicPropertyDetailPageProps) {
  const { id } = await params
  const property = await getCachedProperty(id)

  if (!property) {
    notFound()
  }

  if (property.slug !== id) {
    redirect(`/propiedad/${property.slug}`)
  }

  const siteUrl = getAppUrl()
  const fullAddress = `${property.address}, ${property.city}`

  const contact = getBusinessContact()
  const propertyUrl = `${siteUrl}/propiedad/${property.slug}`
  const whatsappMessage = `Hola, quiero consultar por ${property.title}. Link: ${propertyUrl}`
  const whatsappHref = getWhatsAppHref(contact.whatsappNumber, whatsappMessage)
  const phoneHref = getPhoneHref(contact.phone)
  const emailHref = contact.email ? getGmailComposeHref(contact.email) : null

  const mainImage = property.images[0]?.url
  const galleryImages = property.images.slice(1)

  const googleMapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
  const geocodedCoordinates = await geocodeAddressWithOsm(fullAddress)
  const openStreetMapEmbedUrl = geocodedCoordinates
    ? buildOpenStreetMapEmbedUrl(geocodedCoordinates)
    : null

  const featureSections = buildPropertyFeatureSections(property.propertyFeatures, {
    propertyTypeLabel: getPropertyTypeLabel(property.propertyType),
    operationTypeLabel: getOperationTypeLabel(property.operationType),
    rooms: property.rooms,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: property.areaM2,
    garage: property.garage,
  })

  return (
    <main className="py-8 md:py-12">
      <Container size="public">
        <Breadcrumbs
          className="mb-4 md:mb-5"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Propiedades", href: "/propiedades" },
            { label: property.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <section>
            <Card className="p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Propiedad
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
                    {property.title}
                  </h1>
                  <p className="mt-2 text-zinc-600">
                    {property.city} · {property.address}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge>{getPropertyTypeLabel(property.propertyType)}</StatusBadge>
                  <StatusBadge>{getOperationTypeLabel(property.operationType)}</StatusBadge>
                  {property.featured ? <StatusBadge tone="featured">Destacada</StatusBadge> : null}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Precio publicado
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
                  {formatPropertyPrice(property.price, property.currency)}
                </p>
                <PropertyFeatures
                  rooms={property.rooms}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  areaM2={property.areaM2}
                  garage={property.garage}
                  className="mt-5"
                />
              </div>
            </Card>

            <section className="mt-6">
              {mainImage ? (
                <div className="space-y-4">
                  <img
                    src={mainImage}
                    alt={property.title}
                    className="h-72 w-full rounded-2xl border border-zinc-200 object-cover sm:h-[420px]"
                  />
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                      {galleryImages.map((image) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt={property.title}
                          className="h-28 w-full rounded-xl border border-zinc-200 object-cover sm:h-40"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  title="Esta propiedad aún no tiene imágenes"
                  description="El equipo comercial puede cargarlas desde el dashboard para mejorar la publicación."
                  note="Si necesitas más material visual, escríbenos y te compartimos información adicional."
                />
              )}
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
              <h2 className="text-xl font-semibold text-zinc-900">Descripción</h2>
              <p className="mt-3 leading-relaxed text-zinc-700">
                {property.description ||
                  "Esta propiedad aún no tiene una descripción detallada. Contáctanos para recibir información completa y coordinar una visita."}
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">Ubicación</h2>
                  <p className="mt-1 text-sm text-zinc-600">{fullAddress}</p>
                </div>
                <a
                  href={googleMapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  Ver en Google Maps
                </a>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
                {openStreetMapEmbedUrl ? (
                  <iframe
                    title={`Mapa de ${property.title}`}
                    src={openStreetMapEmbedUrl}
                    className="h-[260px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="grid h-[260px] place-items-center bg-zinc-50 px-4 text-center text-sm text-zinc-600">
                    No se pudo geolocalizar la dirección exacta. Usa el botón para abrir el mapa.
                  </div>
                )}
              </div>
            </section>

            {featureSections.length > 0 ? (
              <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
                <h2 className="text-xl font-semibold text-zinc-900">Características detalladas</h2>
                <div className="mt-5 grid gap-5">
                  {featureSections.map((section) => (
                    <div key={section.id} className="rounded-xl border border-zinc-200 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        {section.title}
                      </h3>
                      <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                        {section.items.map((item) => (
                          <div
                            key={`${section.id}-${item.label}`}
                            className="flex items-start justify-between gap-3 border-b border-zinc-100 py-1.5"
                          >
                            <dt className="text-sm text-zinc-500">{item.label}</dt>
                            <dd className="text-sm font-medium text-zinc-900">{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </section>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <Card className="overflow-hidden">
              <div className="bg-[linear-gradient(130deg,#e8f7ef_0%,#f7faf8_100%)] p-5 md:p-6">
                <h2 className="text-lg font-semibold text-zinc-900">Contacto inmediato</h2>
                <p className="mt-2 text-sm text-zinc-600">
                  Nuestro equipo comercial responde consultas y coordina visitas con rapidez.
                </p>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Consultar ahora por WhatsApp
                  </a>
                ) : (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    WhatsApp no configurado. Completa el formulario para que te contactemos.
                  </p>
                )}
                <div className="mt-3 grid gap-2">
                  {phoneHref && contact.phone ? (
                    <a
                      href={phoneHref}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                    >
                      Llamar al {contact.phone}
                    </a>
                  ) : null}
                  {emailHref && contact.email ? (
                    <a
                      href={emailHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                    >
                      Escribir a {contact.email}
                    </a>
                  ) : null}
                </div>
              </div>
            </Card>

            <LeadForm propertyId={property.id} />
          </aside>
        </div>
      </Container>
    </main>
  )
}
