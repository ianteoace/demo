import { createPropertyAction } from "../actions"
import PropertyForm from "../property-form"
import { EMPTY_PROPERTY_FORM_VALUES } from "@/types/property"

export default function NewPropertyPage() {
  return (
    <PropertyForm
      initialValues={EMPTY_PROPERTY_FORM_VALUES}
      title="Nueva propiedad"
      submitLabel="Crear propiedad"
      action={createPropertyAction}
    />
  )
}
