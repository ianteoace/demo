export type CategoryFormValues = {
  name: string
  slug: string
}

export type CategoryActionState = {
  error: string | null
}

export const EMPTY_CATEGORY_ACTION_STATE: CategoryActionState = {
  error: null,
}

export const EMPTY_CATEGORY_FORM_VALUES: CategoryFormValues = {
  name: "",
  slug: "",
}

function getField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

type ParsedCategoryFormData = {
  name: string
  slug: string
}

type CategoryFormParseResult =
  | { data: ParsedCategoryFormData }
  | { error: string }

export function parseCategoryFormData(formData: FormData): CategoryFormParseResult {
  const name = getField(formData, "name")
  const slug = getField(formData, "slug").toLowerCase()

  if (!name) {
    return { error: "El nombre de la categoria es obligatorio." }
  }

  if (slug && !isValidSlug(slug)) {
    return { error: "El slug solo puede contener letras minusculas, numeros y guiones." }
  }

  return {
    data: {
      name,
      slug,
    },
  }
}
