import type { OrderStatus, Prisma } from "@prisma/client"
import Link from "next/link"

import EmptyState from "@/components/public/empty-state"
import { Button, Container, FilterBar, Input, PageHeader, Section, Select } from "@/components/ui"
import { getOrderStatusLabel, isOrderStatus, ORDER_STATUS_VALUES } from "@/lib/order-status"
import { prisma } from "@/lib/prisma"

import OrdersTable from "./orders-table"

type SearchParams = Promise<{
  q?: string
  status?: string
}>

function parseStatus(status?: string): OrderStatus | "all" {
  if (!status) return "all"
  if (isOrderStatus(status)) return status
  return "all"
}

function buildOrdersWhere({
  q,
  status,
}: {
  q: string
  status: OrderStatus | "all"
}): Prisma.OrderWhereInput {
  return {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { customerName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q?.trim() || ""
  const status = parseStatus(resolvedSearchParams.status)

  const where = buildOrdersWhere({ q, status })

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ])

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          title="Pedidos"
          description="Gestiona pedidos mayoristas creados desde carrito y checkout publico."
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
                    Buscar por cliente o telefono
                  </span>
                  <Input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder="Ej: Luca, +54 11..."
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Estado</span>
                  <Select name="status" defaultValue={status}>
                    <option value="all">Todos</option>
                    {ORDER_STATUS_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {getOrderStatusLabel(value)}
                      </option>
                    ))}
                  </Select>
                </label>
              </>
            }
            actions={
              <>
                <Link href="/dashboard/orders">
                  <Button variant="secondary">Limpiar</Button>
                </Link>
                <p className="text-sm text-[var(--color-muted)]">
                  {totalOrders} {totalOrders === 1 ? "pedido" : "pedidos"}
                </p>
              </>
            }
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Tip: en mobile la tabla se muestra en tarjetas para facilitar lectura y acciones rapidas.
          </p>
        </Section>

        <Section compact>
          {orders.length === 0 ? (
            <EmptyState
              title="No hay pedidos para los filtros aplicados"
              description="Ajusta filtros o limpia la busqueda para ver la actividad completa."
              note="Los pedidos nuevos aparecen automaticamente cuando se confirma checkout."
              actionLabel="Ver todos"
              actionHref="/dashboard/orders"
            />
          ) : (
            <OrdersTable orders={orders} />
          )}
        </Section>
      </Container>
    </main>
  )
}
