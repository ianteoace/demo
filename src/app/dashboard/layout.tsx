import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { AdminAuthorizationError, requireAdmin } from "@/lib/require-admin"
import { getAuthSession } from "@/auth"
import AdminTopbar from "@/components/dashboard/admin-topbar"

function getUserLabel(name?: string | null, email?: string | null) {
  if (name?.trim()) return name.trim()
  if (email?.trim()) return email.split("@")[0]
  return undefined
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getAuthSession()
  if (!session) redirect("/login")

  try {
    await requireAdmin(session)
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirect("/login")
    }
    throw error
  }

  const userLabel = getUserLabel(session.user?.name, session.user?.email)

  return (
    <>
      <AdminTopbar userLabel={userLabel} />
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] text-[var(--color-text)]">
        {children}
      </div>
    </>
  )
}
