import Link from "next/link"
import { LeadStatus, type Prisma } from "@prisma/client"
import { redirect } from "next/navigation"

import EmptyState from "@/components/public/empty-state"
import { Button, Card, Container, FilterBar, Input, PageHeader, Section, Select } from "@/components/ui"
import { getGmailComposeHref } from "@/lib/business-contact"
import { getLeadStatusLabel, getLeadStatusTone, isLeadStatus } from "@/lib/lead-status"
import { prisma } from "@/lib/prisma"
import { AdminAuthorizationError, requireAdmin } from "@/lib/require-admin"

import DeleteLeadButton from "./delete-lead-button"
import LeadStatusSelect from "./lead-status-select"

type SearchParams = Promise<{
  propertyId?: string
  q?: string
  status?: string
  page?: string
}>

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

function parseStatusFilter(status?: string): LeadStatus | "all" {
  if (!status) {
    return "all"
  }

  if (isLeadStatus(status)) {
    return status
  }

  return "all"
}

function buildLeadWhere({
  propertyId,
  q,
  status,
}: {
  propertyId: string
  q: string
  status: LeadStatus | "all"
}): Prisma.LeadWhereInput {
  return {
    ...(propertyId ? { propertyId } : {}),
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }
}

function LeadStatusChip({ status }: { status: LeadStatus }) {
  const tone = getLeadStatusTone(status)
  const toneClass =
    tone === "new"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "contacted"
        ? "bg-sky-50 text-sky-700 ring-sky-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200"
  const dotClass =
    tone === "new" ? "bg-amber-500" : tone === "contacted" ? "bg-sky-500" : "bg-emerald-500"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${toneClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      {getLeadStatusLabel(status)}
    </span>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: number
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

export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirect("/login")
    }

    throw error
  }

  const resolvedSearchParams = await searchParams
  const propertyId = resolvedSearchParams.propertyId?.trim() || ""
  const q = resolvedSearchParams.q?.trim() || ""
  const status = parseStatusFilter(resolvedSearchParams.status)
  const currentPage = Math.max(1, Number(resolvedSearchParams.page || "1") || 1)
  const hasActiveFilters = Boolean(propertyId || q || status !== "all")
  const where = buildLeadWhere({ propertyId, q, status })
  const pendingWhere = buildLeadWhere({ propertyId, q, status: LeadStatus.NEW })
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [properties, leads, recentLeadsCount, pendingLeadsCount, totalLeadsCount] = await Promise.all([
    prisma.property.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: "asc" },
    }),
    prisma.lead.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
    }),
    prisma.lead.count({
      where: {
        ...where,
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.lead.count({ where: pendingWhere }),
    prisma.lead.count({ where }),
  ])

  const uniquePropertiesCount = new Set(leads.map((lead) => lead.property.id)).size
  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage * PAGE_SIZE < totalLeadsCount
  const previousPageHref = `/dashboard/leads${buildQueryString({
    q: q || undefined,
    propertyId: propertyId || undefined,
    status: status === "all" ? undefined : status,
    page: String(currentPage - 1),
  })}`
  const nextPageHref = `/dashboard/leads${buildQueryString({
    q: q || undefined,
    propertyId: propertyId || undefined,
    status: status === "all" ? undefined : status,
    page: String(currentPage + 1),
  })}`

  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          title="Leads"
          description="Gestiona consultas comerciales, prioriza oportunidades recientes y centraliza el seguimiento por propiedad."
        />

        <Section compact>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Leads en pagina" value={leads.length} subtitle="Resultados visibles en esta vista" />
            <MetricCard title="Ultimos 7 dias" value={recentLeadsCount} subtitle="Nuevas consultas comerciales" />
            <MetricCard title="Propiedades consultadas" value={uniquePropertiesCount} subtitle="Con actividad en la pagina actual" />
            <MetricCard title="Pendientes" value={pendingLeadsCount} subtitle="Consultas por gestionar" />
          </div>
        </Section>

        <Section compact>
          <FilterBar
            method="GET"
            fields={
              <>
                <label className="grid gap-1.5 xl:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Buscar por nombre o email
                  </span>
                  <Input type="search" name="q" defaultValue={q} placeholder="Ej: valentina o @gmail.com" />
                </label>

                <label className="grid gap-1.5 xl:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Propiedad</span>
                  <Select name="propertyId" defaultValue={propertyId}>
                    <option value="">Todas las propiedades</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="grid gap-1.5 xl:col-span-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Estado</span>
                  <Select name="status" defaultValue={status}>
                    <option value="all">Todos</option>
                    <option value={LeadStatus.NEW}>{getLeadStatusLabel(LeadStatus.NEW)}</option>
                    <option value={LeadStatus.CONTACTED}>{getLeadStatusLabel(LeadStatus.CONTACTED)}</option>
                    <option value={LeadStatus.CLOSED}>{getLeadStatusLabel(LeadStatus.CLOSED)}</option>
                  </Select>
                </label>
              </>
            }
            actions={
              <>
                <Button type="submit">Filtrar</Button>
                <Link
                  href="/dashboard/leads"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  Limpiar
                </Link>
                <p className="text-sm text-zinc-500">
                  {totalLeadsCount} {totalLeadsCount === 1 ? "lead encontrado" : "leads encontrados"}
                </p>
              </>
            }
          />
        </Section>

        <Section compact>
          {leads.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No hay coincidencias con los filtros aplicados"
                description="Ajusta la busqueda por nombre, email, propiedad o estado para encontrar consultas."
                note="Puedes limpiar filtros para volver a ver toda la actividad comercial."
                actionLabel="Limpiar filtros"
                actionHref="/dashboard/leads"
              />
            ) : (
              <EmptyState
                title="No hay leads registrados"
                description="Cuando lleguen nuevas consultas desde la ficha publica, apareceran aqui para seguimiento comercial."
                note="Mientras tanto, revisa que las propiedades publicadas tengan fotos y descripciones completas."
              />
            )
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="overflow-hidden border-zinc-200 bg-white p-5 shadow-sm md:p-6">
                  <article className="grid gap-4 md:gap-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200">
                          {lead.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-zinc-900">{lead.name}</h2>
                          <a
                            href={getGmailComposeHref(lead.email)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-zinc-600 transition hover:text-zinc-900"
                          >
                            {lead.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <LeadStatusChip status={lead.status} />
                        <span className="text-xs font-medium text-zinc-500">{dateFormatter.format(lead.createdAt)}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Propiedad consultada</p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-900">{lead.property.title}</p>
                        <LeadStatusChip status={lead.status} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Mensaje</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{lead.message}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-2">
                      <LeadStatusSelect leadId={lead.id} status={lead.status} />
                      <a
                        href={getGmailComposeHref(lead.email)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
                      >
                        Contactar
                      </a>
                      <Link
                        href={`/propiedad/${lead.property.slug}`}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                      >
                        Ver ficha publica
                      </Link>
                      <div className="ml-auto">
                        <DeleteLeadButton
                          leadId={lead.id}
                          label="Eliminar"
                          className="inline-flex h-9 items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        />
                      </div>
                    </div>
                  </article>
                </Card>
              ))}
            </div>
          )}
        </Section>

        {totalLeadsCount > 0 ? (
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
              Pagina {currentPage} de {Math.ceil(totalLeadsCount / PAGE_SIZE)}
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
