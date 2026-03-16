"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  // when the provider is rendered from a server component we can pass the
  // already‑fetched session to avoid a flash of unauthenticated state on the
  // client.
  return <SessionProvider session={session}>{children}</SessionProvider>
}