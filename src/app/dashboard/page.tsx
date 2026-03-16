import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

import { authOptions } from "@/auth"
import { Button, Card, Container, PageHeader, Section } from "@/components/ui"
import { getDashboardOverviewMetrics } from "@/lib/dashboard/get-dashboard-overview-metrics"
import LoadDemoDataButton from "./components/load-demo-data-button"

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
          title="Panel de administración"
          description="Controla el estado comercial de tu inmobiliaria, revisa actividad reciente y accede rápido a las tareas operativas."
          actions={
            <>
              <Link href="/dashboard/properties">
                <Button>Gestionar propiedades</Button>
              </Link>
              <Link href="/dashboard/leads">
                <Button variant="secondary">Ver leads</Button>
              </Link>
            </>
          }
        />

        <Section compact>
          <Card className="overflow-hidden border-zinc-900/10 bg-gradient-to-br from-white to-zinc-50 p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Resumen general</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950 md:text-2xl">
              Bienvenido {session.user?.name || "equipo"}.
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600 md:text-base">
              Este panel centraliza tus propiedades, publicaciones destacadas y consultas recibidas para una gestión diaria más clara.
            </p>
          </Card>
        </Section>

        <Section compact title="Métricas clave" description="Indicadores operativos de tu cartera y embudo comercial.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard title="Propiedades" value={metrics.totalProperties} />
            <MetricCard title="Publicadas" value={metrics.publishedProperties} />
            <MetricCard title="Destacadas" value={metrics.featuredProperties} />
            <MetricCard
              title="Borradores"
              value={metrics.draftProperties}
              subtitle="Propiedades no publicadas"
            />
            <MetricCard title="Leads" value={metrics.totalLeads} />
            <MetricCard title="Últimos 7 días" value={metrics.recentLeads} subtitle="Leads recientes" />
          </div>
        </Section>

        <Section
          compact
          title="Actividad y acciones rápidas"
          description="Tareas recomendadas para mantener actualizada la cartera y responder más rápido."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold text-zinc-900">Publicar nueva propiedad</h3>
              <p className="mt-2 text-sm text-zinc-600">
                Crea una nueva ficha para sumar inventario comercial y empezar a captar consultas.
              </p>
              <Link
                href="/dashboard/properties/new"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Crear propiedad
              </Link>
            </Card>

            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold text-zinc-900">Revisar borradores</h3>
              <p className="mt-2 text-sm text-zinc-600">
                Tienes {metrics.draftProperties} {metrics.draftProperties === 1 ? "borrador pendiente" : "borradores pendientes"} para completar y publicar.
              </p>
              <Link
                href="/dashboard/properties?status=draft"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Ver borradores
              </Link>
            </Card>

            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold text-zinc-900">Leads recientes</h3>
              <p className="mt-2 text-sm text-zinc-600">
                En los últimos 7 días ingresaron {metrics.recentLeads} {metrics.recentLeads === 1 ? "lead" : "leads"} nuevos.
              </p>
              <Link
                href="/dashboard/leads"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Ver leads recientes
              </Link>
            </Card>
          </div>

          {session.user?.role === Role.ADMIN ? <LoadDemoDataButton /> : null}
        </Section>
      </Container>
    </main>
  )
}
