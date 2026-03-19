import type { InquiryStatus, Prisma } from "@prisma/client"
import Link from "next/link"

import EmptyState from "@/components/public/empty-state"
import { Button, Container, FilterBar, Input, PageHeader, Section, Select } from "@/components/ui"
import { getInquiryStatusLabel, INQUIRY_STATUS_VALUES, isInquiryStatus } from "@/lib/inquiry-status"
import { prisma } from "@/lib/prisma"

import InquiriesTable from "./inquiries-table"

type SearchParams = Promise<{
  q?: string
  status?: string
  productId?: string
}>

function parseStatus(status?: string): InquiryStatus | "all" {
  if (!status) return "all"
  if (isInquiryStatus(status)) return status
  return "all"
}

function buildInquiriesWhere({
  q,
  status,
  productId,
}: {
  q: string
  status: InquiryStatus | "all"
  productId: string
}): Prisma.InquiryWhereInput {
  return {
    ...(status !== "all" ? { status } : {}),
    ...(productId ? { productId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q?.trim() || ""
  const status = parseStatus(resolvedSearchParams.status)
  const productId = resolvedSearchParams.productId?.trim() || ""

  const where = buildInquiriesWhere({ q, status, productId })

  const [products, inquiries, totalInquiries] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.inquiry.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.count({ where }),
  ])

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          title="Consultas"
          description="Centraliza y actualiza el seguimiento comercial de consultas mayoristas."
          actions={
            <Link href="/dashboard/products">
              <Button variant="secondary">Ver productos</Button>
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
                    Buscar en nombre, empresa, telefono o email
                  </span>
                  <Input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder="Ej: Luca, Hamburgueseria, +54..."
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Producto</span>
                  <Select name="productId" defaultValue={productId}>
                    <option value="">Todos</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Estado</span>
                  <Select name="status" defaultValue={status}>
                    <option value="all">Todos</option>
                    {INQUIRY_STATUS_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {getInquiryStatusLabel(value)}
                      </option>
                    ))}
                  </Select>
                </label>
              </>
            }
            actions={
              <>
                <Link href="/dashboard/inquiries">
                  <Button variant="secondary">Limpiar</Button>
                </Link>
                <p className="text-sm text-[var(--color-muted)]">
                  {totalInquiries} {totalInquiries === 1 ? "consulta" : "consultas"}
                </p>
              </>
            }
          />
        </Section>

        <Section compact>
          {inquiries.length === 0 ? (
            <EmptyState
              title="No hay consultas para los filtros aplicados"
              description="Ajusta los filtros o limpia la busqueda para ver toda la actividad."
              note="Las nuevas consultas apareceran aqui para seguimiento comercial."
              actionLabel="Ver todas"
              actionHref="/dashboard/inquiries"
            />
          ) : (
            <InquiriesTable
              inquiries={inquiries.map((inquiry) => ({
                id: inquiry.id,
                name: inquiry.name,
                company: inquiry.company,
                phone: inquiry.phone,
                email: inquiry.email,
                productName: inquiry.product?.name || null,
                status: inquiry.status,
                createdAt: inquiry.createdAt,
              }))}
            />
          )}
        </Section>
      </Container>
    </main>
  )
}
