export type BusinessContact = {
  email: string | null
  phone: string | null
  whatsappNumber: string | null
}

function normalizeContactValue(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function getBusinessContact(): BusinessContact {
  return {
    email: normalizeContactValue(process.env.NEXT_PUBLIC_BUSINESS_EMAIL),
    phone: normalizeContactValue(process.env.NEXT_PUBLIC_BUSINESS_PHONE),
    whatsappNumber: normalizeContactValue(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  }
}

function normalizeWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/\D+/g, "")
  return digits.length > 0 ? digits : null
}

export function getWhatsAppHref(whatsappNumber: string | null, message?: string): string | null {
  if (!whatsappNumber) return null
  const normalized = normalizeWhatsAppNumber(whatsappNumber)
  if (!normalized) return null
  if (!message) return `https://wa.me/${normalized}`
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function getPhoneHref(phone: string | null): string | null {
  if (!phone) return null
  const normalized = phone.replace(/\s+/g, "")
  return `tel:${normalized}`
}

export function getGmailComposeHref(email: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
}
