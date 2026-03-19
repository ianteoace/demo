"use client"

import { Role } from "@prisma/client"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Container } from "@/components/ui"
import { getBusinessContact, getPhoneHref, getWhatsAppHref } from "@/lib/business-contact"
import { useCart } from "./cart-provider"

type NavItem = {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/#ofertas", label: "Ofertas" },
  { href: "/#contacto", label: "Contacto" },
]

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M2.5 4h2l2.2 10.5a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.2L21 7H6.2" />
    </svg>
  )
}

function getUserLabel(name?: string | null, email?: string | null) {
  if (name?.trim()) return name.trim()
  if (email?.trim()) return email.split("@")[0]
  return "Usuario"
}

export default function SiteHeader() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems, hasHydrated } = useCart()

  const contact = getBusinessContact()
  const whatsappHref = getWhatsAppHref(contact.whatsappNumber)
  const phoneHref = getPhoneHref(contact.phone)
  const isAdmin = session?.user?.role === Role.ADMIN
  const userLabel = getUserLabel(session?.user?.name, session?.user?.email)

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(10,10,12,0.92)] backdrop-blur">
      <Container size="public" className="flex h-16 items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="SoloAderezos">
          <Image
            src="/soloaderezos-logo.svg"
            alt="Logo SoloAderezos"
            width={42}
            height={42}
            className="h-10 w-10 rounded-full ring-1 ring-[var(--color-border)] md:h-11 md:w-11"
            priority
          />
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text)] md:text-base">
            SoloAderezos
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/carrito"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              aria-label="Ver carrito"
            >
              <CartIcon className="h-4.5 w-4.5" />
              {hasHydrated && totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-semibold leading-none text-white">
                  {totalItems}
                </span>
              ) : null}
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-success)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-success-hover)]"
              >
                WhatsApp
              </a>
            ) : null}

            {session ? (
              <>
                <span className="inline-flex h-10 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text)]">
                  {userLabel}
                </span>
                {isAdmin ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                  >
                    Panel admin
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text)] md:hidden"
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? "Cerrar" : "Menu"}
        </button>
      </Container>

      {isMenuOpen ? (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
          <Container size="public" className="grid gap-2 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[#1d1f24] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/carrito"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[#1d1f24] hover:text-white"
            >
              <CartIcon className="h-4.5 w-4.5" />
              <span>Carrito</span>
              {hasHydrated && totalItems > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-semibold leading-none text-white">
                  {totalItems}
                </span>
              ) : null}
            </Link>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-success)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-success-hover)]"
              >
                Contactar por WhatsApp
              </a>
            ) : null}

            {phoneHref && contact.phone ? (
              <a
                href={phoneHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Llamar al {contact.phone}
              </a>
            ) : null}

            {session ? (
              <>
                <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)]">
                  {userLabel}
                </div>
                {isAdmin ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                  >
                    Ir a Dashboard
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
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
