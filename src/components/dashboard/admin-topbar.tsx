import Link from "next/link"

import { Container } from "@/components/ui"
import AdminSignOutButton from "./admin-sign-out-button"

type AdminTopbarProps = {
  userLabel?: string
}

const adminNavItems = [
  { href: "/dashboard", label: "Panel admin" },
  { href: "/dashboard/properties", label: "Propiedades" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/users", label: "Usuarios" },
]

export default function AdminTopbar({ userLabel }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <Container size="wide" className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-900">
            Inmobiliaria Admin
          </Link>

          <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-300 px-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
          >
            Ver sitio
          </Link>

          {userLabel ? (
            <span className="hidden h-9 items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 md:inline-flex">
              {userLabel}
            </span>
          ) : null}

          <AdminSignOutButton />
        </div>
      </Container>
    </header>
  )
}
