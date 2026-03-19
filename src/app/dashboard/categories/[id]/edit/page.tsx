import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"

import { updateCategoryAction } from "../../actions"
import CategoryForm from "../../category-form"

type EditCategoryPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (!category) {
    notFound()
  }

  return (
    <CategoryForm
      title="Editar categoria"
      submitLabel="Guardar cambios"
      initialValues={{
        name: category.name,
        slug: category.slug,
      }}
      action={updateCategoryAction.bind(null, category.id)}
    />
  )
}
