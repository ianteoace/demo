import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { toPropertyFormValues } from "@/types/property"

import { updatePropertyAction } from "../../actions"
import PropertyForm from "../../property-form"

type EditPropertyPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const { id } = await params

  const property = await prisma.property.findUnique({
    where: { id },
  })

  if (!property) {
    notFound()
  }

  return (
    <PropertyForm
      initialValues={toPropertyFormValues(property)}
      title="Editar propiedad"
      submitLabel="Guardar cambios"
      action={updatePropertyAction.bind(null, property.id)}
    />
  )
}
