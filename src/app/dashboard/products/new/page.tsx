import { prisma } from "@/lib/prisma"
import { EMPTY_PRODUCT_FORM_VALUES } from "@/types/product"

import { createProductAction } from "../actions"
import ProductForm from "../product-form"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  })

  return (
    <ProductForm
      initialValues={EMPTY_PRODUCT_FORM_VALUES}
      title="Nuevo producto"
      submitLabel="Crear producto"
      categories={categories}
      action={createProductAction}
    />
  )
}
