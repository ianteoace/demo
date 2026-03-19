export type CheckoutActionState = {
  error: string | null
  orderId: string | null
  confirmationToken: string | null
}

export const EMPTY_CHECKOUT_ACTION_STATE: CheckoutActionState = {
  error: null,
  orderId: null,
  confirmationToken: null,
}

export type OrderCartItemPayload = {
  productId: string
  quantity: number
}

type ParsedCheckoutFormData = {
  customerName: string
  company: string | null
  phone: string
  email: string | null
  notes: string | null
  items: OrderCartItemPayload[]
}

function getField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function normalizeOptional(value: string) {
  return value ? value : null
}

function parseItemsPayload(raw: string): OrderCartItemPayload[] | null {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null

    const normalized: OrderCartItemPayload[] = []

    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") return null

      const productId =
        "productId" in entry && typeof entry.productId === "string"
          ? entry.productId.trim()
          : ""

      const quantity =
        "quantity" in entry && typeof entry.quantity === "number"
          ? Math.floor(entry.quantity)
          : NaN

      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
        return null
      }

      normalized.push({ productId, quantity })
    }

    return normalized
  } catch {
    return null
  }
}

export type CheckoutFormParseResult =
  | { data: ParsedCheckoutFormData }
  | { error: string }

export function parseCheckoutFormData(formData: FormData): CheckoutFormParseResult {
  const customerName = getField(formData, "customerName")
  const company = getField(formData, "company")
  const phone = getField(formData, "phone")
  const email = getField(formData, "email")
  const notes = getField(formData, "notes")
  const website = getField(formData, "website")
  const rawItems = getField(formData, "items")

  if (website) {
    return { error: "Solicitud invalida." }
  }

  if (!customerName || !phone) {
    return { error: "Nombre y telefono son obligatorios." }
  }

  if (customerName.length < 2 || customerName.length > 80) {
    return { error: "El nombre debe tener entre 2 y 80 caracteres." }
  }

  if (phone.length < 6 || phone.length > 30) {
    return { error: "El telefono debe tener entre 6 y 30 caracteres." }
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El email no tiene un formato valido." }
  }

  if (notes && notes.length > 1500) {
    return { error: "Las notas no pueden superar 1500 caracteres." }
  }

  const items = parseItemsPayload(rawItems)
  if (!items) {
    return { error: "El carrito enviado es invalido o esta vacio." }
  }

  return {
    data: {
      customerName,
      company: normalizeOptional(company),
      phone,
      email: normalizeOptional(email),
      notes: normalizeOptional(notes),
      items,
    },
  }
}
