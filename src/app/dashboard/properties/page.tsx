import Link from "next/link"
import { OperationType, Prisma, PropertyType } from "@prisma/client"

import EmptyState from "@/components/public/empty-state"
import { Button, Card, Container, FilterBar, Input, PageHeader, Section, Select } from "@/components/ui"
import { getOperationTypeLabel } from "@/lib/property-operation-type"
import { getPropertyFeatureSummary } from "@/lib/property-features"
import { formatPropertyPrice } from "@/lib/property-price"
import { getPropertyTypeLabel } from "@/lib/property-type"
import { prisma } from "@/lib/prisma"
import type { PropertyWithImages } from "@/types/property"

import DeletePropertyButton from "./delete-property-button"

type StatusFilter = "all" | "published" | "draft" | "featured"
type OperationFilter = "all" | OperationType
type PropertyTypeFilter = "all" | PropertyType

type SearchParams = Promise<{
  q?: string
  city?: string
  status?: string
  operationType?: string
  propertyType?: string
  page?: string
}>

type PropertyFilters = {
  q: string
  city: string
  status: StatusFilter
  operationType: OperationFilter
  propertyType: PropertyTypeFilter
}

const PAGE_SIZE = 12

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

function parseStatusFilter(status?: string): StatusFilter {
  if (status === "published" || status === "draft" || status === "featured") {
    return status
  }

  return "all"
}

function parseOperationFilter(operationType?: string): OperationFilter {
  if (operationType === OperationType.SALE || operationType === OperationType.RENT || operationType === OperationType.BOTH) {
    return operationType
  }

  return "all"
}

function parsePropertyTypeFilter(propertyType?: string): PropertyTypeFilter {
  if (
    propertyType === PropertyType.APARTMENT ||
    propertyType === PropertyType.HOUSE ||
    propertyType === PropertyType.PH ||
    propertyType === PropertyType.LAND ||
    propertyType === PropertyType.COMMERCIAL ||
    propertyType === PropertyType.OFFICE
  ) {
    return propertyType
  }

  return "all"
}

function buildPropertiesWhere(filters: PropertyFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {}

  if (filters.q) {
    where.title = {
      contains: filters.q,
      mode: "insensitive",
    }
  }

  if (filters.city) {
    where.city = filters.city
  }

  if (filters.status === "published") {
    where.published = true
  } else if (filters.status === "draft") {
    where.published = false
  } else if (filters.status === "featured") {
    where.featured = true
  }

  if (filters.operationType !== "all") {
    where.operationType = filters.operationType
  }

  if (filters.propertyType !== "all") {
    where.propertyType = filters.propertyType
  }

  return where
}

async function getProperties(filters: PropertyFilters, page: number): Promise<PropertyWithImages[]> {
  return prisma.property.findMany({
    where: buildPropertiesWhere(filters),
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  })
}

async function getAvailableCities(): Promise<string[]> {
  const cities = await prisma.property.findMany({
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  })

  return cities.map((entry) => entry.city).filter(Boolean)
}

type DashboardMetrics = {
  totalProperties: number
  totalPublished: number
  totalFeatured: number
  totalLeads: number
  topPropertyByLeads: {
    title: string
    leadsCount: number
  } | null
}

async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [totalProperties, totalPublished, totalFeatured, totalLeads, topLeadGroup] =
    await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { published: true } }),
      prisma.property.count({ where: { featured: true } }),
      prisma.lead.count(),
      prisma.lead.groupBy({
        by: ["propertyId"],
        _count: { _all: true },
        orderBy: {
          _count: {
            propertyId: "desc",
          },
        },
        take: 1,
      }),
    ])

  if (topLeadGroup.length === 0) {
    return {
      totalProperties,
      totalPublished,
      totalFeatured,
      totalLeads,
      topPropertyByLeads: null,
    }
  }

  const top = topLeadGroup[0]
  const property = await prisma.property.findUnique({
    where: { id: top.propertyId },
    select: { title: true },
  })

  return {
    totalProperties,
    totalPublished,
    totalFeatured,
    totalLeads,
    topPropertyByLeads: property
      ? {
          title: property.title,
          leadsCount: top._count._all,
        }
      : null,
  }
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string | number
  subtitle?: string
}) {
  return (
    <Card className="p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-zinc-600">{subtitle}</p> : null}
    </Card>
  )
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: "success" | "danger" | "featured" | "neutral"
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "danger"
        ? "bg-red-50 text-red-700 ring-red-200"
        : tone === "featured"
          ? "bg-amber-50 text-amber-700 ring-amber-200"
          : "bg-zinc-100 text-zinc-600 ring-zinc-200"

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClass}`}>
      {label}
    </span>
  )
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams

  const filters: PropertyFilters = {
    q: resolvedSearchParams.q?.trim() || "",
    city: resolvedSearchParams.city?.trim() || "",
    status: parseStatusFilter(resolvedSearchParams.status),
    operationType: parseOperationFilter(resolvedSearchParams.operationType),
    propertyType: parsePropertyTypeFilter(resolvedSearchParams.propertyType),
  }
  const currentPage = Math.max(1, Number(resolvedSearchParams.page || "1") || 1)
  const where = buildPropertiesWhere(filters)

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.city ||
      filters.status !== "all" ||
      filters.operationType !== "all" ||
      filters.propertyType !== "all",
  )

  const [properties, metrics, cities, totalFilteredProperties] = await Promise.all([
    getProperties(filters, currentPage),
    getDashboardMetrics(),
    getAvailableCities(),
    prisma.property.count({ where }),
  ])

  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage * PAGE_SIZE < totalFilteredProperties
  const previousPageHref = `/dashboard/properties${buildQueryString({
    q: filters.q || undefined,
    city: filters.city || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    operationType: filters.operationType === "all" ? undefined : filters.operationType,
    propertyType: filters.propertyType === "all" ? undefined : filters.propertyType,
    page: String(currentPage - 1),
  })}`
  const nextPageHref = `/dashboard/properties${buildQueryString({
    q: filters.q || undefined,
    city: filters.city || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    operationType: filters.operationType === "all" ? undefined : filters.operationType,
    propertyType: filters.propertyType === "all" ? undefined : filters.propertyType,
    page: String(currentPage + 1),
  })}`

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          title="Propiedades"
          description="Administra publicaciones, estado comercial e imágenes desde un solo panel."
          actions={
            <Link
              href="/dashboard/properties/new"
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Agregar propiedad
            </Link>
          }
        />

        <Section compact>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard title="Total propiedades" value={metrics.totalProperties} />
            <MetricCard title="Publicadas" value={metrics.totalPublished} />
            <MetricCard title="Destacadas" value={metrics.totalFeatured} />
            <MetricCard title="Total leads" value={metrics.totalLeads} />
            <MetricCard
              title="Propiedad con más leads"
              value={metrics.topPropertyByLeads ? metrics.topPropertyByLeads.title : "Sin datos"}
              subtitle={
                metrics.topPropertyByLeads
                  ? `${metrics.topPropertyByLeads.leadsCount} leads`
                  : "Crea publicaciones para empezar a medir conversión."
              }
            />
          </div>
        </Section>

        <Section compact>
          <FilterBar
            method="GET"
            fields={
              <>
                <label className="grid gap-1.5 xl:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Buscar por título
                  </span>
                  <Input
                    type="search"
                    name="q"
                    defaultValue={filters.q}
                    placeholder="Ej: Casa moderna en Caballito"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Ciudad</span>
                  <Select name="city" defaultValue={filters.city}>
                    <option value="">Todas las ciudades</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Estado</span>
                  <Select name="status" defaultValue={filters.status}>
                    <option value="all">Todas</option>
                    <option value="published">Publicadas</option>
                    <option value="draft">Borradores</option>
                    <option value="featured">Destacadas</option>
                  </Select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Operación</span>
                  <Select name="operationType" defaultValue={filters.operationType}>
                    <option value="all">Todas</option>
                    <option value={OperationType.SALE}>Venta</option>
                    <option value={OperationType.RENT}>Alquiler</option>
                    <option value={OperationType.BOTH}>Venta y alquiler</option>
                  </Select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Tipo</span>
                  <Select name="propertyType" defaultValue={filters.propertyType}>
                    <option value="all">Todos</option>
                    <option value={PropertyType.APARTMENT}>Departamento</option>
                    <option value={PropertyType.HOUSE}>Casa</option>
                    <option value={PropertyType.PH}>PH</option>
                    <option value={PropertyType.LAND}>Terreno</option>
                    <option value={PropertyType.COMMERCIAL}>Local</option>
                    <option value={PropertyType.OFFICE}>Oficina</option>
                  </Select>
                </label>
              </>
            }
            actions={
              <>
                <Button type="submit">Aplicar filtros</Button>
                <Link
                  href="/dashboard/properties"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  Limpiar
                </Link>
                <p className="text-sm text-zinc-500">
                  {totalFilteredProperties} {totalFilteredProperties === 1 ? "resultado" : "resultados"}
                </p>
              </>
            }
          />
        </Section>

        <Section compact>
          {properties.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No hay coincidencias con los filtros aplicados"
                description="Ajusta la búsqueda por título, ciudad o estado para encontrar propiedades."
                note="Prueba con menos filtros o limpia la búsqueda para ver todo el inventario."
                actionLabel="Limpiar filtros"
                actionHref="/dashboard/properties"
              />
            ) : (
              <EmptyState
                title="Todavía no hay propiedades cargadas"
                description="Crea tu primera publicación para comenzar a captar consultas en el portal."
                note="Consejo: comienza con una propiedad destacada y al menos una imagen principal."
                actionLabel="Crear propiedad"
                actionHref="/dashboard/properties/new"
              />
            )
          ) : (
            <div className="grid gap-4">
              {properties.map((property) => {
                const firstImage = property.images[0]
                const featureSummary = getPropertyFeatureSummary({
                  rooms: property.rooms,
                  bedrooms: property.bedrooms,
                  bathrooms: property.bathrooms,
                  areaM2: property.areaM2,
                  garage: property.garage,
                }).slice(0, 5)

                return (
                  <Card key={property.id} className="p-4 md:p-5">
                    <article className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        {firstImage ? (
                          <img
                            src={firstImage.url}
                            alt={property.title}
                            className="h-32 w-full rounded-xl border border-zinc-200 object-cover sm:h-24 sm:w-36"
                          />
                        ) : (
                          <div className="grid h-32 w-full place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-sm text-zinc-500 sm:h-24 sm:w-36">
                            Sin imagen
                          </div>
                        )}

                        <div>
                          <h2 className="text-lg font-semibold text-zinc-900">{property.title}</h2>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <StatusPill
                              label={property.published ? "Publicada" : "Borrador"}
                              tone={property.published ? "success" : "danger"}
                            />
                            <StatusPill
                              label={property.featured ? "Destacada" : "Estándar"}
                              tone={property.featured ? "featured" : "neutral"}
                            />
                            <StatusPill label={getPropertyTypeLabel(property.propertyType)} tone="neutral" />
                            <StatusPill label={getOperationTypeLabel(property.operationType)} tone="neutral" />
                          </div>
                          <p className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">
                            {formatPropertyPrice(property.price, property.currency)}
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">{property.city}</p>
                          {featureSummary.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {featureSummary.map((feature) => (
                                <StatusPill key={feature} label={feature} tone="neutral" />
                              ))}
                            </div>
                          ) : null}
                          <p className="mt-1 text-xs text-zinc-500">slug: {property.slug}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:max-w-[340px] md:justify-end">
                        <Link
                          href={`/dashboard/properties/${property.id}/edit`}
                          className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/dashboard/properties/${property.id}/images`}
                          className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                        >
                          Imágenes
                        </Link>
                        <Link
                          href={`/propiedad/${property.slug}`}
                          className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                        >
                          Ver pública
                        </Link>
                        <DeletePropertyButton
                          propertyId={property.id}
                          label="Eliminar propiedad"
                          className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        />
                      </div>
                    </article>
                  </Card>
                )
              })}
            </div>
          )}
        </Section>

        {totalFilteredProperties > 0 ? (
          <Card className="mt-6 flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            {hasPreviousPage ? (
              <Link
                href={previousPageHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Anterior
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm text-zinc-400">
                Anterior
              </span>
            )}

            <span className="text-center text-sm font-medium text-zinc-700">
              Página {currentPage} de {Math.ceil(totalFilteredProperties / PAGE_SIZE)}
            </span>

            {hasNextPage ? (
              <Link
                href={nextPageHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Siguiente
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm text-zinc-400">
                Siguiente
              </span>
            )}
          </Card>
        ) : null}
      </Container>
    </main>
  )
}
