import type { Metadata } from "next"
import Link from "next/link"

import EmptyState from "@/components/public/empty-state"
import ProductCard from "@/components/public/product-card"
import { Card, Container, PageHeader, Section } from "@/components/ui"
import { getBusinessContact, getPhoneHref, getWhatsAppHref } from "@/lib/business-contact"
import { prisma } from "@/lib/prisma"

const HOME_OFFERS_LIMIT = 6

export const metadata: Metadata = {
  title: "Distribuidora mayorista de aderezos",
  description:
    "Compra aderezos por volumen para tu negocio. Explora ofertas mayoristas, arma tu carrito y envia pedidos comerciales de forma simple.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Distribuidora mayorista de aderezos",
    description:
      "Catalogo mayorista de aderezos con ofertas activas, compra minima combinable y gestion de pedidos por WhatsApp.",
    url: "/",
  },
  twitter: {
    title: "Distribuidora mayorista de aderezos",
    description:
      "Explora productos y ofertas mayoristas en SoloAderezos para reponer stock de forma agil.",
  },
}

async function getHomeCatalogData() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      isOnSale: true,
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
        take: 1,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: HOME_OFFERS_LIMIT,
  })

  const offerProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : await prisma.product.findMany({
          where: {
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
              take: 1,
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          take: HOME_OFFERS_LIMIT,
        })

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  })

  return {
    offerProducts,
    categories,
    usedFallback: featuredProducts.length === 0,
  }
}

export default async function Home() {
  const contact = getBusinessContact()
  const phoneHref = getPhoneHref(contact.phone)
  const whatsappHref = getWhatsAppHref(
    contact.whatsappNumber,
    "Hola! Quiero info mayorista y productos en oferta de SoloAderezos.",
  )

  const { offerProducts, categories, usedFallback } = await getHomeCatalogData()

  return (
    <main className="py-6 md:py-8">
      <Container size="public">
        <div className="mb-4 rounded-2xl border border-[var(--color-primary)]/40 bg-[rgba(225,6,0,0.12)] px-4 py-3 md:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">Regla mayorista</p>
          <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
            Compra minima mayorista: <span className="font-semibold">50 unidades combinables</span>.
          </p>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[linear-gradient(125deg,#121318_0%,#171920_45%,#0f1014_100%)] px-6 py-7 md:px-10 md:py-9">
          <div className="absolute -right-8 -top-10 h-44 w-44 rounded-full bg-[rgba(225,6,0,0.26)] blur-3xl" />
          <div className="absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-[rgba(255,255,255,0.08)] blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="grid gap-4">
              <PageHeader
                eyebrow="Distribuidora mayorista"
                title="Precio mayorista real en aderezos para tu negocio."
                description="Compra por volumen con respuesta comercial rapida y reposicion constante."
                className="[&_h1]:text-[var(--color-text)] [&_p]:text-[var(--color-muted)] [&_p.text-zinc-500]:text-[var(--color-primary)]"
                actions={
                  <>
                    <Link
                      href="/productos"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-6 text-sm font-semibold text-white transition hover:bg-[#b90500]"
                    >
                      Ver precios y productos
                    </Link>
                    <Link
                      href="/productos?onSale=1"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                    >
                      Ver ofertas
                    </Link>
                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                      >
                        Cotizar por WhatsApp
                      </a>
                    ) : null}
                  </>
                }
              />
              <ul className="grid gap-1 text-sm font-medium text-[var(--color-muted)] md:grid-cols-3">
                <li>Entrega rapida</li>
                <li>Atencion por WhatsApp</li>
                <li>Stock permanente</li>
              </ul>
            </div>

            <Card className="self-start border-[var(--color-border)] bg-[rgba(21,22,26,0.88)] p-4 md:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                Venta mayorista
              </p>
              <ul className="mt-2 grid gap-1.5 text-sm text-[var(--color-muted)]">
                <li>Pedido simple para reposicion semanal.</li>
                <li>Linea Natura y aderezos de alta rotacion.</li>
                <li>Soporte comercial directo para volumen.</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {phoneHref && contact.phone ? (
                  <a
                    href={phoneHref}
                    className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                  >
                    {contact.phone}
                  </a>
                ) : null}
                <Link
                  href="/productos"
                  className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                >
                  Ver ofertas activas
                </Link>
              </div>
            </Card>
          </div>
        </section>

        <Section
          id="ofertas"
          className="mt-6 scroll-mt-24 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6 [&_h2]:text-[var(--color-text)] [&_p]:text-[var(--color-muted)]"
          title="Ofertas mayoristas destacadas"
          description={
            usedFallback
              ? "Se estan actualizando ofertas. Te mostramos productos activos para no frenar tus compras."
              : "Aprovecha promociones vigentes y acelera tu reposicion comercial."
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/productos?onSale=1"
                className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                Ver todas las ofertas
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Ver catalogo completo
              </Link>
            </div>
          }
        >
          {offerProducts.length === 0 ? (
            <EmptyState
              title="No hay productos visibles por ahora"
              description="Estamos actualizando el catalogo. Vuelve en breve para ver nuevas ofertas."
              note="Tambien puedes pedir asistencia comercial por WhatsApp."
              actionLabel="Ir a productos"
              actionHref="/productos"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {offerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    presentation: product.presentation,
                    unitPrice: product.unitPrice,
                    isOnSale: product.isOnSale,
                    category: { name: product.category.name },
                    images: product.images,
                  }}
                  whatsappNumber={contact.whatsappNumber}
                />
              ))}
            </div>
          )}
        </Section>

        <Section
          id="categorias"
          className="mt-6 scroll-mt-24 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6 [&_h2]:text-[var(--color-text)] [&_p]:text-[var(--color-muted)]"
          title="Compra por categoria"
          description="Acceso rapido para encontrar lineas de producto segun tu tipo de negocio."
          compact
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/productos?category=${category.slug}`}
                className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 transition hover:border-[#3a3d44] hover:bg-[#20232a]"
              >
                <p className="text-sm font-semibold text-[var(--color-text)] group-hover:text-white">
                  {category.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">
                  {category.description || "Linea comercial disponible en catalogo mayorista."}
                </p>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          id="beneficios"
          className="mt-6 scroll-mt-24 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--color-text)] md:p-6 [&_h2]:text-[var(--color-text)] [&_p]:text-[var(--color-muted)]"
          title="Beneficios para compra mayorista"
          description="Condiciones comerciales pensadas para reposicion continua en negocios gastronomicos."
          compact
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/productos"
                className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                Ir al catalogo
              </Link>
              <Link
                href="/productos?onSale=1"
                className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Ver ofertas activas
              </Link>
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">Compra mayorista combinable</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Llega al minimo de 50 unidades mezclando productos.</p>
            </Card>
            <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">Atencion rapida por WhatsApp</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Respuesta comercial directa para cotizar y coordinar.</p>
            </Card>
            <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">Reposicion para negocios</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Flujo agil para mantener stock en rotacion semanal.</p>
            </Card>
            <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">Ofertas comerciales activas</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Promociones visibles para optimizar cada pedido.</p>
            </Card>
          </div>
        </Section>

        <Section
          id="como-comprar"
          className="mt-6 scroll-mt-24 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6 [&_h2]:text-[var(--color-text)] [&_p]:text-[var(--color-muted)]"
          title="Como comprar en SoloAderezos"
          description="Un proceso simple para que tu pedido mayorista quede confirmado en minutos."
          compact
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">Paso 1</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">Elegir productos</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Explora categorias y precios del catalogo mayorista.</p>
            </Card>
            <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">Paso 2</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">Armar carrito</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Combina items hasta alcanzar el minimo total de 50 unidades.</p>
            </Card>
            <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">Paso 3</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">Enviar pedido</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Completa checkout y deja el pedido registrado.</p>
            </Card>
            <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">Paso 4</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">Coordinar por WhatsApp</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Confirmamos detalles comerciales, entrega y seguimiento.</p>
            </Card>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/productos"
              className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              Empezar compra
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-success)] bg-[rgba(22,128,59,0.18)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[rgba(22,128,59,0.28)]"
              >
                Resolver dudas por WhatsApp
              </a>
            ) : null}
          </div>
        </Section>

        <Section
          id="contacto"
          className="mt-6 scroll-mt-24 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6 [&_h2]:text-[var(--color-text)] [&_p]:text-[var(--color-muted)]"
          title="Listo para comprar al por mayor?"
          description="Escribenos por WhatsApp y te armamos una propuesta segun volumen y frecuencia."
          compact
          actions={
            <>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-success)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--color-success-hover)]"
                >
                  Contactar por WhatsApp
                </a>
              ) : null}
              <Link
                href="/productos"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Ver catalogo completo
              </Link>
            </>
          }
        />

        <section className="mt-6 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[linear-gradient(130deg,#14161b_0%,#1a1d24_65%,#14161b_100%)] px-5 py-6 md:px-7 md:py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">Cierre comercial</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">
            Reponer aderezos para tu negocio puede ser simple y rapido.
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)] md:text-base">
            Explora el catalogo, arma tu pedido mayorista y coordinamos por WhatsApp para que tu reposicion no se frene.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/productos"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              Ver catalogo mayorista
            </Link>
            <Link
              href="/productos?onSale=1"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
            >
              Ver ofertas
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-success)] bg-[rgba(22,128,59,0.18)] px-6 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[rgba(22,128,59,0.28)]"
              >
                Pedir asesoria por WhatsApp
              </a>
            ) : null}
          </div>
        </section>
      </Container>
    </main>
  )
}
