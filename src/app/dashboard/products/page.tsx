import Link from "next/link"
import type { Prisma } from "@prisma/client"

import EmptyState from "@/components/public/empty-state"
import { Button, Container, FilterBar, Input, PageHeader, Section, Select } from "@/components/ui"
import { prisma } from "@/lib/prisma"

import ProductsTable from "./products-table"

type SearchParams = Promise<{
  q?: string
  category?: string
  sale?: string
}>

function buildProductsWhere({
  q,
  category,
  sale,
}: {
  q: string
  category: string
  sale: "all" | "on" | "off"
}): Prisma.ProductWhereInput {
  if (!q && !category && sale === "all") return {}

  return {
    ...(category ? { categoryId: category } : {}),
    ...(sale === "on" ? { isOnSale: true } : {}),
    ...(sale === "off" ? { isOnSale: false } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { presentation: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q?.trim() || ""
  const category = resolvedSearchParams.category?.trim() || ""
  const sale = resolvedSearchParams.sale === "on" || resolvedSearchParams.sale === "off"
    ? resolvedSearchParams.sale
    : "all"
  const where = buildProductsWhere({ q, category, sale })

  const [categories, products, totalProducts] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, isActive: true },
    }),
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            images: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.product.count({ where }),
  ])

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          title="Productos"
          description="Gestiona el catalogo mayorista y su estado comercial."
          actions={
            <Link href="/dashboard/products/new">
              <Button>Crear producto</Button>
            </Link>
          }
        />

        <Section compact>
          <FilterBar
            method="GET"
            instant
            fields={
              <>
                <label className="grid gap-1.5 xl:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Buscar por nombre, categoria o marca
                  </span>
                  <Input type="search" name="q" defaultValue={q} placeholder="Ej: mayonesa, ketchup, SoloAderezos" />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Categoria</span>
                  <Select name="category" defaultValue={category}>
                    <option value="">Todas</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                        {item.isActive ? "" : " (inactiva)"}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Oferta</span>
                  <Select name="sale" defaultValue={sale}>
                    <option value="all">Todos</option>
                    <option value="on">Solo ofertas</option>
                    <option value="off">Sin oferta</option>
                  </Select>
                </label>
              </>
            }
            actions={
              <>
                <Link href="/dashboard/products">
                  <Button variant="secondary">Limpiar</Button>
                </Link>
                <p className="text-sm text-[var(--color-muted)]">
                  {totalProducts} {totalProducts === 1 ? "producto" : "productos"}
                </p>
              </>
            }
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Tip: en mobile se muestra una vista compacta con accesos rapidos a editar, imagenes y estados.
          </p>
        </Section>

        <Section compact>
          {products.length === 0 ? (
            <EmptyState
              title={q || category || sale !== "all" ? "No hay productos para los filtros aplicados" : "Todavia no hay productos cargados"}
              description={
                q || category || sale !== "all"
                  ? "Prueba con otro termino o limpia los filtros para ver todos los resultados."
                  : "Crea tu primer producto para empezar a construir el catalogo mayorista."
              }
              note="Puedes filtrar por categoria u oferta para mantenimiento comercial rapido."
              actionLabel="Crear producto"
              actionHref="/dashboard/products/new"
            />
          ) : (
            <ProductsTable
              products={products.map((product) => ({
                id: product.id,
                name: product.name,
                categoryName: product.category.name,
                brand: product.brand,
                presentation: product.presentation,
                unitPrice: product.unitPrice,
                isOnSale: product.isOnSale,
                isFeatured: product.isFeatured,
                isActive: product.isActive,
                sortOrder: product.sortOrder,
                imagesCount: product._count.images,
              }))}
            />
          )}
        </Section>
      </Container>
    </main>
  )
}
