import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { toProductFormValues } from "@/types/product"

import { updateProductAction } from "../../actions"
import ProductForm from "../../product-form"

type EditProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
    }),
    prisma.category.findMany({
      orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <ProductForm
      initialValues={toProductFormValues(product)}
      title="Editar producto"
      submitLabel="Guardar cambios"
      categories={categories}
      action={updateProductAction.bind(null, product.id)}
    />
  )
}
