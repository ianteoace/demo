import Link from "next/link"

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
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-7">
      <Container size="public" className="grid gap-4 text-sm text-[var(--color-muted)] md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-[var(--color-text)]">SoloAderezos</span>
          <Link href="/productos" className="transition hover:text-white">
            Catalogo
          </Link>
          <Link href="/#ofertas" className="transition hover:text-white">
            Ofertas
          </Link>
          <Link href="/#categorias" className="transition hover:text-white">
            Categorias
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-[#7de3a7] transition hover:text-[#a6efc4]">
              WhatsApp
            </a>
          ) : null}
          {contact.phone && phoneHref ? (
            <a href={phoneHref} className="transition hover:text-white">
              {contact.phone}
            </a>
          ) : null}
          {contact.email && emailHref ? (
            <a href={emailHref} target="_blank" rel="noreferrer" className="transition hover:text-white">
              {contact.email}
            </a>
          ) : null}
        </div>
      </Container>
    </footer>
  )
}
