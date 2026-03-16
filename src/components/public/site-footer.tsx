import { Container } from "@/components/ui"
import {
  getBusinessContact,
  getGmailComposeHref,
  getPhoneHref,
  getWhatsAppHref,
} from "@/lib/business-contact"

export default function SiteFooter() {
  const contact = getBusinessContact()
  const whatsappHref = getWhatsAppHref(contact.whatsappNumber)
  const phoneHref = getPhoneHref(contact.phone)
  const emailHref = contact.email ? getGmailComposeHref(contact.email) : null

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-6">
      <Container size="public" className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
        <span className="mr-2 font-semibold text-zinc-800">Contacto:</span>
        {contact.phone && phoneHref ? <a href={phoneHref}>Celular {contact.phone}</a> : null}
        {contact.email && emailHref ? (
          <a href={emailHref} target="_blank" rel="noreferrer">
            {contact.email}
          </a>
        ) : null}
        {whatsappHref ? (
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        ) : null}
      </Container>
    </footer>
  )
}
