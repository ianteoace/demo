import Link from "next/link"
import { OperationType } from "@prisma/client"
import { PropertyType } from "@prisma/client"
import type { Prisma } from "@prisma/client"

import EmptyState from "@/components/public/empty-state"
import Breadcrumbs from "@/components/public/breadcrumbs"
import PropertyCard from "@/components/public/property-card"
import { Button, Card, Container, FilterBar, Input, PageHeader, Section, Select } from "@/components/ui"
import { getOperationTypeLabel } from "@/lib/property-operation-type"
import { getPropertyTypeLabel } from "@/lib/property-type"
import { prisma } from "@/lib/prisma"
import type { PropertyWithImages } from "@/types/property"

const PAGE_SIZE = 10

type SearchParams = Promise<{
  city?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  bathrooms?: string
  propertyType?: string
  operationType?: string
  page?: string
}>

type PublicOperationFilter = "all" | OperationType
type PublicPropertyTypeFilter = "all" | PropertyType

function parsePositiveInteger(value?: string) {
  if (!value) return undefined

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined
  }

  return parsed
}

function buildQueryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value)
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

function parseOptionalNonNegativeInteger(value?: string) {
  if (!value) return undefined

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined
  }

  return parsed
}

function parseOperationFilter(value?: string): PublicOperationFilter {
  if (value === OperationType.SALE || value === OperationType.RENT || value === OperationType.BOTH) {
    return value
  }

  return "all"
}

function parsePropertyTypeFilter(value?: string): PublicPropertyTypeFilter {
  if (
    value === PropertyType.APARTMENT ||
    value === PropertyType.HOUSE ||
    value === PropertyType.PH ||
    value === PropertyType.LAND ||
    value === PropertyType.COMMERCIAL ||
    value === PropertyType.OFFICE
  ) {
    return value
  }

  return "all"
}

export default async function PublicPropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const city = resolvedSearchParams.city?.trim() || ""
  const minPrice = parsePositiveInteger(resolvedSearchParams.minPrice)
  const maxPrice = parsePositiveInteger(resolvedSearchParams.maxPrice)
  const bedrooms = parseOptionalNonNegativeInteger(resolvedSearchParams.bedrooms)
  const bathrooms = parseOptionalNonNegativeInteger(resolvedSearchParams.bathrooms)
  const propertyType = parsePropertyTypeFilter(resolvedSearchParams.propertyType)
  const operationType = parseOperationFilter(resolvedSearchParams.operationType)
  const currentPage = Math.max(1, Number(resolvedSearchParams.page || "1") || 1)

  const where: Prisma.PropertyWhereInput = {
    published: true,
    ...(city
      ? {
          city: {
            contains: city,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...((minPrice !== undefined || maxPrice !== undefined)
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(bedrooms !== undefined ? { bedrooms: { gte: bedrooms } } : {}),
    ...(bathrooms !== undefined ? { bathrooms: { gte: bathrooms } } : {}),
    ...(propertyType !== "all" ? { propertyType } : {}),
    ...(operationType !== "all" ? { operationType } : {}),
  }

  const propertiesPromise: Promise<PropertyWithImages[]> = prisma.property.findMany({
    where,
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (currentPage - 1) * PAGE_SIZE,
  })

  const [properties, totalProperties] = await Promise.all([
    propertiesPromise,
    prisma.property.count({ where }),
  ])

  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage * PAGE_SIZE < totalProperties

  const previousPageHref = `/propiedades${buildQueryString({
    city: city || undefined,
    minPrice: resolvedSearchParams.minPrice,
    maxPrice: resolvedSearchParams.maxPrice,
    bedrooms: resolvedSearchParams.bedrooms,
    bathrooms: resolvedSearchParams.bathrooms,
    propertyType: propertyType === "all" ? undefined : propertyType,
    operationType: operationType === "all" ? undefined : operationType,
    page: String(currentPage - 1),
  })}`

  const nextPageHref = `/propiedades${buildQueryString({
    city: city || undefined,
    minPrice: resolvedSearchParams.minPrice,
    maxPrice: resolvedSearchParams.maxPrice,
    bedrooms: resolvedSearchParams.bedrooms,
    bathrooms: resolvedSearchParams.bathrooms,
    propertyType: propertyType === "all" ? undefined : propertyType,
    operationType: operationType === "all" ? undefined : operationType,
    page: String(currentPage + 1),
  })}`

  return (
    <main className="py-8 md:py-12">
      <Container size="public">
        <Breadcrumbs
          className="mb-4 md:mb-5"
          items={[
            { label: "Inicio", href: "/" },
            { label: "Propiedades" },
          ]}
        />

        <PageHeader
          title="Propiedades"
          description="Filtra por ubicación, rango de precio y características para encontrar opciones alineadas a tu búsqueda."
        />

        <Section compact>
          <FilterBar
            method="GET"
            fields={
              <>
                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Ciudad
                  </span>
                  <Input
                    type="text"
                    name="city"
                    placeholder="Ej: Córdoba"
                    defaultValue={city}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Precio mín.
                  </span>
                  <Input
                    type="number"
                    name="minPrice"
                    placeholder="0"
                    min="0"
                    step="1"
                    defaultValue={resolvedSearchParams.minPrice || ""}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Precio máx.
                  </span>
                  <Input
                    type="number"
                    name="maxPrice"
                    placeholder="500000"
                    min="0"
                    step="1"
                    defaultValue={resolvedSearchParams.maxPrice || ""}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Dormitorios
                  </span>
                  <Input
                    type="number"
                    name="bedrooms"
                    placeholder="Minimos"
                    min="0"
                    step="1"
                    defaultValue={resolvedSearchParams.bedrooms || ""}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Baños
                  </span>
                  <Input
                    type="number"
                    name="bathrooms"
                    placeholder="Minimos"
                    min="0"
                    step="1"
                    defaultValue={resolvedSearchParams.bathrooms || ""}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Tipo de propiedad
                  </span>
                  <Select
                    name="propertyType"
                    defaultValue={propertyType}
                  >
                    <option value="all">Todos</option>
                    <option value={PropertyType.APARTMENT}>{getPropertyTypeLabel(PropertyType.APARTMENT)}</option>
                    <option value={PropertyType.HOUSE}>{getPropertyTypeLabel(PropertyType.HOUSE)}</option>
                    <option value={PropertyType.PH}>{getPropertyTypeLabel(PropertyType.PH)}</option>
                    <option value={PropertyType.LAND}>{getPropertyTypeLabel(PropertyType.LAND)}</option>
                    <option value={PropertyType.COMMERCIAL}>{getPropertyTypeLabel(PropertyType.COMMERCIAL)}</option>
                    <option value={PropertyType.OFFICE}>{getPropertyTypeLabel(PropertyType.OFFICE)}</option>
                  </Select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Operación
                  </span>
                  <Select
                    name="operationType"
                    defaultValue={operationType}
                  >
                    <option value="all">Todas</option>
                    <option value={OperationType.SALE}>{getOperationTypeLabel(OperationType.SALE)}</option>
                    <option value={OperationType.RENT}>{getOperationTypeLabel(OperationType.RENT)}</option>
                    <option value={OperationType.BOTH}>{getOperationTypeLabel(OperationType.BOTH)}</option>
                  </Select>
                </label>
              </>
            }
            actions={
              <>
                <Button type="submit">Aplicar filtros</Button>
                <Link
                  href="/propiedades"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  Limpiar
                </Link>
                <p className="text-sm text-zinc-500">
                  {totalProperties} {totalProperties === 1 ? "resultado" : "resultados"}
                </p>
              </>
            }
          />
        </Section>

        <Section compact>
          {properties.length === 0 ? (
            <Card className="p-4 md:p-6">
              <EmptyState
                title="No encontramos propiedades con esos filtros"
                description="Prueba ampliar el rango de precio o quitar filtros para ver más oportunidades disponibles."
                note="Si prefieres, escríbenos por WhatsApp y te ayudamos a armar una búsqueda personalizada."
                actionLabel="Quitar filtros"
                actionHref="/propiedades"
              />
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </Section>

        <Card className="mt-8 flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          {hasPreviousPage ? (
            <Link
              href={previousPageHref}
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Anterior
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm text-zinc-400">
              Anterior
            </span>
          )}

          <span className="text-center text-sm font-medium text-zinc-700">
            Página {currentPage}
            {totalProperties > 0 ? ` de ${Math.ceil(totalProperties / PAGE_SIZE)}` : ""}
          </span>

          {hasNextPage ? (
            <Link
              href={nextPageHref}
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Siguiente
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm text-zinc-400">
              Siguiente
            </span>
          )}
        </Card>
      </Container>
    </main>
  )
}
