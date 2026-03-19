import Link from "next/link"
import type { Metadata } from "next"
import type { Prisma } from "@prisma/client"

import EmptyState from "@/components/public/empty-state"
import ProductCard from "@/components/public/product-card"
import { Button, Card, Container, FilterBar, Input, PageHeader, Section, Select } from "@/components/ui"
import { getBusinessContact } from "@/lib/business-contact"
import { prisma } from "@/lib/prisma"

type SearchParams = Promise<{
  q?: string
  category?: string
  onSale?: string
  sort?: string
}>

export const metadata: Metadata = {
  title: "Catalogo mayorista",
  description:
    "Catalogo comercial de SoloAderezos con busqueda por nombre, filtros por categoria y ofertas para compras mayoristas.",
  alternates: {
    canonical: "/productos",
  },
  openGraph: {
    title: "Catalogo mayorista",
    description:
      "Encuentra aderezos por categoria, consulta precios y descubre ofertas activas para pedidos por volumen.",
    url: "/productos",
  },
  twitter: {
    title: "Catalogo mayorista",
    description:
      "Explora el catalogo comercial de SoloAderezos con filtros y ofertas para compras mayoristas.",
  },
}

const SORT_VALUES = ["recent", "name-asc", "name-desc", "price-asc", "price-desc"] as const
type SortValue = (typeof SORT_VALUES)[number]

function parseOnSale(value?: string): boolean {
  return value === "1"
}

function parseSort(value?: string): SortValue {
  if (!value) return "recent"
  return (SORT_VALUES as readonly string[]).includes(value) ? (value as SortValue) : "recent"
}

function buildProductsWhere({
  q,
  category,
  onSale,
}: {
  q: string
  category: string
  onSale: boolean
}): Prisma.ProductWhereInput {
  return {
    isActive: true,
    ...(onSale ? { isOnSale: true } : {}),
    category: {
      isActive: true,
      ...(category ? { slug: category } : {}),
    },
    ...(q
      ? {
          name: {
            contains: q,
            mode: "insensitive",
          },
        }
      : {}),
  }
}

function buildProductsOrderBy(sort: SortValue): Prisma.ProductOrderByWithRelationInput[] {
  if (sort === "name-asc") return [{ name: "asc" }]
  if (sort === "name-desc") return [{ name: "desc" }]
  if (sort === "price-asc") return [{ unitPrice: "asc" }, { name: "asc" }]
  if (sort === "price-desc") return [{ unitPrice: "desc" }, { name: "asc" }]
  return [{ sortOrder: "asc" }, { createdAt: "desc" }]
}

export default async function PublicProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q?.trim() || ""
  const category = resolvedSearchParams.category?.trim() || ""
  const onSale = parseOnSale(resolvedSearchParams.onSale)
  const sort = parseSort(resolvedSearchParams.sort)

  const where = buildProductsWhere({ q, category, onSale })
  const orderBy = buildProductsOrderBy(sort)
  const contact = getBusinessContact()

  const [categories, products, totalOffers] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          take: 1,
        },
      },
      orderBy,
    }),
    prisma.product.count({
      where: {
        isActive: true,
        isOnSale: true,
        category: { isActive: true },
      },
    }),
  ])

  return (
    <main className="py-6 md:py-8">
      <Container size="public">
        <PageHeader
          eyebrow="Catalogo comercial"
          title="Productos y ofertas mayoristas"
          description="Filtra por categoria y encuentra productos activos listos para consulta inmediata."
          className="[&_h1]:text-[var(--color-text)] [&_p]:text-[var(--color-muted)] [&_p.text-zinc-500]:text-[var(--color-primary)]"
          actions={
            <Link
              href="/#contacto"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
            >
              Contacto comercial
            </Link>
          }
        />

        <Section compact className="mt-6">
          <Card className="border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 md:p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
              Ofertas y reposicion
            </p>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Estas viendo productos activos del canal mayorista. Si necesitas volumen o linea completa, consulta por WhatsApp desde cada ficha.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/productos?onSale=1"
                className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Ver solo ofertas
              </Link>
              <span className="text-xs text-[var(--color-muted)]">{totalOffers} ofertas activas</span>
            </div>
          </Card>
        </Section>

        <Section compact className="mt-5 [&_h2]:text-[var(--color-text)] [&_p]:text-[var(--color-muted)]">
          <FilterBar
            dense
            className="border-[var(--color-border)] bg-[var(--color-surface-soft)]"
            method="GET"
            fields={
              <>
                <label className="grid gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Buscar por nombre
                  </span>
                  <Input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder="Ej: mayonesa, ketchup, mostaza"
                    className="h-9 rounded-md px-2.5 text-xs"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Categoria</span>
                  <Select name="category" defaultValue={category} className="h-9 rounded-md px-2.5 text-xs">
                    <option value="">Todas</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Promocion</span>
                  <Select name="onSale" defaultValue={onSale ? "1" : "0"} className="h-9 rounded-md px-2.5 text-xs">
                    <option value="0">Todos</option>
                    <option value="1">Solo ofertas</option>
                  </Select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Ordenar</span>
                  <Select name="sort" defaultValue={sort} className="h-9 rounded-md px-2.5 text-xs">
                    <option value="recent">Recientes</option>
                    <option value="name-asc">Nombre A-Z</option>
                    <option value="name-desc">Nombre Z-A</option>
                    <option value="price-asc">Precio menor a mayor</option>
                    <option value="price-desc">Precio mayor a menor</option>
                  </Select>
                </label>
              </>
            }
            actions={
              <>
                <Button type="submit" className="h-9 px-4 text-xs">
                  Aplicar
                </Button>
                <Link
                  href="/productos"
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                >
                  Limpiar
                </Link>
                <p className="text-xs text-[var(--color-muted)] md:ml-auto">
                  {products.length} {products.length === 1 ? "producto" : "productos"}
                </p>
              </>
            }
          />
        </Section>

        <Section compact className="mt-5">
          {products.length === 0 ? (
            <EmptyState
              title={onSale ? "No hay ofertas para esos filtros" : "No encontramos productos con esos filtros"}
              description={
                onSale
                  ? "Prueba cambiando categoria o busqueda, o vuelve al catalogo completo."
                  : "Ajusta la busqueda o limpia filtros para ver todas las opciones activas."
              }
              note="Si prefieres, escribenos por WhatsApp y te recomendamos la linea adecuada."
              actionLabel="Ver todos los productos"
              actionHref="/productos"
            />
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
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
                    category: product.category,
                    images: product.images,
                  }}
                  whatsappNumber={contact.whatsappNumber}
                  dense
                />
              ))}
            </div>
          )}
        </Section>
      </Container>
    </main>
  )
}
