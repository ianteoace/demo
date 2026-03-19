import Link from "next/link"

import EmptyState from "@/components/public/empty-state"
import { Button, Container, PageHeader, Section } from "@/components/ui"
import { prisma } from "@/lib/prisma"

import CategoriesTable from "./categories-table"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  })

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          title="Categorias"
          description="Administra categorias del catalogo para mantener filtros y clasificacion de productos."
          actions={
            <Link href="/dashboard/categories/new">
              <Button>Crear categoria</Button>
            </Link>
          }
        />
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Una categoria con productos asociados no se puede eliminar hasta reasignar esos productos.
        </p>

        <Section compact>
          {categories.length === 0 ? (
            <EmptyState
              title="Todavia no hay categorias cargadas"
              description="Crea tu primera categoria para comenzar a organizar el catalogo."
              note="Las categorias nuevas quedan disponibles en formularios y filtros de productos."
              actionLabel="Crear categoria"
              actionHref="/dashboard/categories/new"
            />
          ) : (
            <CategoriesTable
              categories={categories.map((category) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                productsCount: category._count.products,
              }))}
            />
          )}
        </Section>
      </Container>
    </main>
  )
}
