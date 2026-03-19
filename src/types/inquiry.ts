export type InquiryActionState = {
  error: string | null
  success: string | null
}

export const EMPTY_INQUIRY_ACTION_STATE: InquiryActionState = {
  error: null,
  success: null,
}

type ParsedInquiryFormData = {
  name: string
  company: string | null
  phone: string
  email: string | null
  message: string
}

function getField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function normalizeOptional(value: string) {
  return value ? value : null
}

export type InquiryFormParseResult =
  | { data: ParsedInquiryFormData }
  | { error: string }

export function parseInquiryFormData(formData: FormData): InquiryFormParseResult {
  const name = getField(formData, "name")
  const company = getField(formData, "company")
  const phone = getField(formData, "phone")
  const email = getField(formData, "email")
  const message = getField(formData, "message")
  const website = getField(formData, "website")

  if (website) {
    return { error: "Solicitud invalida." }
  }

  if (!name || !phone || !message) {
    return { error: "Nombre, telefono y mensaje son obligatorios." }
  }

  if (name.length < 2 || name.length > 80) {
    return { error: "El nombre debe tener entre 2 y 80 caracteres." }
  }

  if (phone.length < 6 || phone.length > 30) {
    return { error: "El telefono debe tener entre 6 y 30 caracteres." }
  }

  if (message.length < 10 || message.length > 1500) {
    return { error: "El mensaje debe tener entre 10 y 1500 caracteres." }
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El email no tiene un formato valido." }
  }

  return {
    data: {
      name,
      company: normalizeOptional(company),
      phone,
      email: normalizeOptional(email),
      message,
    },
  }
}
