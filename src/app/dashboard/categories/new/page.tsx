import { EMPTY_CATEGORY_FORM_VALUES } from "@/types/category"

import { createCategoryAction } from "../actions"
import CategoryForm from "../category-form"

export default function NewCategoryPage() {
  return (
    <CategoryForm
      title="Nueva categoria"
      submitLabel="Crear categoria"
      initialValues={EMPTY_CATEGORY_FORM_VALUES}
      action={createCategoryAction}
    />
  )
}
