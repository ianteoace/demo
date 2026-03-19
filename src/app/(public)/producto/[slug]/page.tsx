import type { Metadata } from "next"
import { notFound } from "next/navigation"

import EmptyState from "@/components/public/empty-state"
import ProductGallery from "@/components/public/product-gallery"
import { Card, Container } from "@/components/ui"
import { getAppUrl } from "@/lib/app-url"
import { getBusinessContact, getPhoneHref, getWhatsAppHref } from "@/lib/business-contact"
import { formatArsAmount } from "@/lib/currency"
import { prisma } from "@/lib/prisma"

import InquiryForm from "./inquiry-form"
import ProductCartPanel from "./product-cart-panel"

type PublicProductDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

async function getActiveProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      category: {
        isActive: true,
      },
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  })
}

export async function generateMetadata({
  params,
}: PublicProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getActiveProductBySlug(slug)

  if (!product) {
    return {
      title: "Producto no encontrado",
      description: "El producto solicitado no esta disponible.",
    }
  }

  const siteUrl = getAppUrl()
  const canonical = `${siteUrl}/producto/${product.slug}`
  const firstImage = product.images[0]
  const title = product.name
  const presentationLabel = product.presentation || "presentacion no especificada"
  const categoryLabel = product.category.name
  const baseCommercialText = `${product.name} - ${presentationLabel} - categoria ${categoryLabel}.`
  const detailText =
    product.shortDescription ||
    product.description ||
    "Consulta comercial mayorista y condiciones por volumen."
  const description = `${baseCommercialText} ${detailText}`.slice(0, 160)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "SoloAderezos",
      images: firstImage
        ? [
            {
              url: firstImage.url,
              alt: firstImage.alt || product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: firstImage ? "summary_large_image" : "summary",
      title,
      description,
      images: firstImage ? [firstImage.url] : [],
    },
  }
}

export default async function PublicProductDetailPage({
  params,
}: PublicProductDetailPageProps) {
  const { slug } = await params
  const product = await getActiveProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const contact = getBusinessContact()
  const phoneHref = getPhoneHref(contact.phone)
  const siteUrl = getAppUrl()
  const productUrl = `${siteUrl}/producto/${product.slug}`
  const whatsappHref = getWhatsAppHref(
    contact.whatsappNumber,
    `Hola! Quiero consultar por ${product.name}. Link: ${productUrl}`,
  )

  return (
    <main className="py-8 md:py-12">
      <Container size="public">
        <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
          <section className="grid gap-6">
            <Card className="p-5 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {product.category.name}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)] md:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {product.brand || "Marca no especificada"}
                {product.presentation ? ` - ${product.presentation}` : ""}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                Precio estimado por unidad: {formatArsAmount(product.unitPrice)}
              </p>
              {product.shortDescription ? (
                <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">{product.shortDescription}</p>
              ) : null}
            </Card>

            {product.images.length > 0 ? (
              <ProductGallery
                images={product.images.map((image) => ({
                  id: image.id,
                  url: image.url,
                  alt: image.alt,
                }))}
                title={product.name}
              />
            ) : (
              <EmptyState
                title="Este producto aun no tiene imagenes publicas"
                description="Estamos cargando material visual para mejorar la ficha comercial."
              />
            )}

            <Card className="p-5 md:p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Descripcion comercial</h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--color-muted)]">
                {product.description || "Solicita informacion comercial para recibir ficha completa y condiciones mayoristas."}
              </p>
            </Card>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <Card className="overflow-hidden">
              <div className="bg-[linear-gradient(130deg,#1b1d24_0%,#171920_100%)] p-5 md:p-6">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Atencion comercial</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Consultanos por volumen, frecuencia de entrega y propuesta mayorista.
                </p>

                <div className="mt-4 grid gap-2">
                  <ProductCartPanel
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      brand: product.brand,
                      presentation: product.presentation,
                      imageUrl: product.images[0]?.url || null,
                      unitPrice: product.unitPrice,
                    }}
                  />
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--color-success)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-success-hover)]"
                    >
                      Consultar por WhatsApp
                    </a>
                  ) : null}
                  {phoneHref && contact.phone ? (
                    <a
                      href={phoneHref}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                    >
                      Llamar al {contact.phone}
                    </a>
                  ) : null}
                </div>
              </div>
            </Card>

            <InquiryForm productId={product.id} />
          </aside>
        </div>
      </Container>
    </main>
  )
}
