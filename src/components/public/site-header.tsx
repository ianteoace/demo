"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"

import { Container } from "@/components/ui"
import { getBusinessContact, getPhoneHref, getWhatsAppHref } from "@/lib/business-contact"

type NavItem = {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#contacto", label: "Contacto" },
]

function getUserLabel(name?: string | null, email?: string | null) {
  if (name?.trim()) return name.trim()
  if (email?.trim()) return email.split("@")[0]
  return "Usuario"
}

export default function SiteHeader() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const contact = getBusinessContact()
  const whatsappHref = getWhatsAppHref(contact.whatsappNumber)
  const phoneHref = getPhoneHref(contact.phone)
  const isAdmin = session?.user?.role === Role.ADMIN
  const userLabel = getUserLabel(session?.user?.name, session?.user?.email)

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur">
      <Container size="public" className="flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-900 md:text-base">
          Inmobiliaria
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                WhatsApp
              </a>
            ) : null}

            {session ? (
              <>
                <span className="inline-flex h-10 items-center rounded-full border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700">
                  {userLabel}
                </span>
                {isAdmin ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                  >
                    Panel admin
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 px-3 text-sm font-semibold text-zinc-700 md:hidden"
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? "Cerrar" : "Menu"}
        </button>
      </Container>

      {isMenuOpen ? (
        <div className="border-t border-zinc-200 bg-zinc-50 md:hidden">
          <Container size="public" className="grid gap-2 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Contactar por WhatsApp
              </a>
            ) : null}

            {phoneHref && contact.phone ? (
              <a
                href={phoneHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Llamar al {contact.phone}
              </a>
            ) : null}

            {session ? (
              <>
                <div className="mt-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700">
                  {userLabel}
                </div>
                {isAdmin ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                  >
                    Ir a Dashboard
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Ingresar
              </Link>
            )}
          </Container>
        </div>
      ) : null}
    </header>
  )
}
