import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/auth"
import { Button, Card, Container, PageHeader, Section } from "@/components/ui"
import { formatArsAmount } from "@/lib/currency"
import { getDashboardOverviewMetrics } from "@/lib/dashboard/get-dashboard-overview-metrics"

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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)]">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-[var(--color-muted)]">{subtitle}</p> : null}
    </Card>
  )
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const metrics = await getDashboardOverviewMetrics()

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          eyebrow="Panel administrativo"
          title="Panel de administracion"
          description="Gestion del dominio nuevo de SoloAderezos: productos, consultas y pedidos mayoristas."
          actions={
            <>
              <Link href="/dashboard/products">
                <Button>Gestionar productos</Button>
              </Link>
              <Link href="/dashboard/orders">
                <Button variant="secondary">Ver pedidos</Button>
              </Link>
              <Link href="/dashboard/inquiries">
                <Button variant="secondary">Ver consultas</Button>
              </Link>
            </>
          }
        />

        <Section compact>
          <Card className="overflow-hidden bg-[var(--color-surface)] p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Resumen general</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-[var(--color-text)] md:text-2xl">
              Bienvenido {session.user?.name || "equipo"}.
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)] md:text-base">
              El panel nuevo ya opera sobre Product, ProductImage e Inquiry.
              El flujo comercial ahora incluye carrito y pedidos para seguimiento operativo.
            </p>
          </Card>
        </Section>

        <Section compact title="Metricas clave" description="Indicadores del dominio comercial actual.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Pedidos totales" value={metrics.totalOrders} subtitle="Pedidos registrados por checkout" />
            <MetricCard title="Pedidos pendientes" value={metrics.pendingOrders} subtitle="Requieren seguimiento comercial" />
            <MetricCard title="Productos activos" value={metrics.activeProducts} subtitle="Disponibles en el catalogo publico" />
            <MetricCard
              title="Importe acumulado"
              value={formatArsAmount(metrics.totalAmountSnapshot)}
              subtitle="Suma estimada de pedidos registrados"
            />
          </div>
        </Section>

        <Section compact title="Acciones rapidas" description="Operaciones principales del nuevo dominio.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Crear producto</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Agrega un nuevo producto con categoria, estado y datos comerciales.
              </p>
              <div className="mt-4">
                <Link href="/dashboard/products/new">
                  <Button>Nuevo producto</Button>
                </Link>
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Gestionar imagenes</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Carga y ordena imagenes de productos con integracion Cloudinary.
              </p>
              <div className="mt-4">
                <Link href="/dashboard/products">
                  <Button variant="secondary">Ir a productos</Button>
                </Link>
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Gestionar pedidos</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Revisa pedidos creados por checkout y actualiza su estado comercial.
              </p>
              <div className="mt-4">
                <Link href="/dashboard/orders">
                  <Button variant="secondary">Ver pedidos</Button>
                </Link>
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Seguimiento de consultas</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Actualiza estados de inquiry y prioriza oportunidades nuevas.
              </p>
              <div className="mt-4">
                <Link href="/dashboard/inquiries">
                  <Button variant="secondary">Ver consultas</Button>
                </Link>
              </div>
            </Card>
          </div>

        </Section>
      </Container>
    </main>
  )
}
