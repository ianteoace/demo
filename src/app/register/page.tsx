import { notFound, redirect } from "next/navigation"

import { assertBootstrapAccess } from "@/lib/bootstrap"
import { prisma } from "@/lib/prisma"

import RegisterForm from "./register-form"

type RegisterPageSearchParams = Promise<{
  bootstrapToken?: string
}>

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: RegisterPageSearchParams
}) {
  const resolvedSearchParams = await searchParams
  const bootstrapToken = resolvedSearchParams.bootstrapToken?.trim() || ""
  const bootstrapAccess = assertBootstrapAccess(bootstrapToken)

  if (!bootstrapAccess.ok) {
    notFound()
  }

  const usersCount = await prisma.user.count()

  if (usersCount > 0) {
    redirect("/login")
  }

  return <RegisterForm bootstrapToken={bootstrapToken} />
}
