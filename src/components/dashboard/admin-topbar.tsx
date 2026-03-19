import Link from "next/link"

import { Container } from "@/components/ui"
import AdminSignOutButton from "./admin-sign-out-button"

type AdminTopbarProps = {
  userLabel?: string
}

const adminNavItems = [
  { href: "/dashboard", label: "Panel admin" },
  { href: "/dashboard/products", label: "Productos" },
  { href: "/dashboard/categories", label: "Categorias" },
  { href: "/dashboard/inquiries", label: "Consultas" },
  { href: "/dashboard/orders", label: "Pedidos" },
  { href: "/dashboard/users", label: "Usuarios" },
]

export default function AdminTopbar({ userLabel }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(10,10,12,0.9)] backdrop-blur">
      <Container size="wide" className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text)]">
            SoloAderezos Admin
          </Link>

          <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
          >
            Ver sitio
          </Link>

          {userLabel ? (
            <span className="hidden h-9 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-muted)] md:inline-flex">
              {userLabel}
            </span>
          ) : null}

          <AdminSignOutButton />
        </div>
      </Container>
    </header>
  )
}
