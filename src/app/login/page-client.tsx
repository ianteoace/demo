"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useMemo, useState } from "react"

import { Button, Card, Container, Input } from "@/components/ui"

function getSafeCallbackUrl(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith("/")) return null
  if (value.startsWith("//")) return null
  if (value.includes("\\")) return null

  const parsed = new URL(value, "http://localhost")
  if (parsed.origin !== "http://localhost") return null

  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

type LoginPageClientProps = {
  isBootstrapRegistrationEnabled: boolean
}

export default function LoginPageClient({
  isBootstrapRegistrationEnabled,
}: LoginPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const callbackUrl = useMemo(
    () => getSafeCallbackUrl(searchParams.get("callbackUrl")),
    [searchParams],
  )
  const infoMessage = useMemo(() => {
    const message = searchParams.get("message")
    return message?.trim() ? message : null
  }, [searchParams])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: callbackUrl || "/dashboard",
    })

    setLoading(false)

    if (!response) {
      setError("No se pudo iniciar sesion. Intenta nuevamente.")
      return
    }

    if (response.error) {
      setError("Email o contrasena incorrectos.")
      return
    }

    const targetUrl = getSafeCallbackUrl(response.url) || callbackUrl || "/dashboard"
    router.push(targetUrl)
    router.refresh()
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] py-10 md:py-14">
      <Container size="public">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-stretch">
          <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[linear-gradient(125deg,#101116_0%,#171920_55%,#0f1014_100%)] p-6 text-white md:p-10">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[rgba(225,6,0,0.26)] blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-[rgba(255,255,255,0.08)] blur-3xl" aria-hidden="true" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">SoloAderezos</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Panel comercial para gestionar catalogo e inquiries en un solo lugar
              </h1>
              <p className="mt-4 max-w-xl text-sm text-[var(--color-muted)] md:text-base">
                Administra productos, imagenes y consultas comerciales con una operacion simple y ordenada.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/65 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Inventario</p>
                  <p className="mt-2 text-sm font-medium text-white">Productos activos y destacados</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/65 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Consultas</p>
                  <p className="mt-2 text-sm font-medium text-white">Seguimiento comercial con estado real</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/65 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Publico</p>
                  <p className="mt-2 text-sm font-medium text-white">Catalogo y fichas optimizadas</p>
                </div>
              </div>
            </div>
          </section>

          <Card className="self-center p-6 md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Acceso admin</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)]">Iniciar sesion</h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">Ingresa con tu cuenta para acceder al dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              {infoMessage ? (
                <p className="rounded-lg border border-[var(--color-success)]/45 bg-[rgba(22,128,59,0.2)] px-3 py-2 text-sm text-[var(--color-text)]">
                  {infoMessage}
                </p>
              ) : null}

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-[var(--color-text)]">Email</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  placeholder="admin@soloaderezos.com"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-[var(--color-text)]">Contrasena</span>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Tu contrasena"
                />
              </label>

              {error ? (
                <p className="rounded-lg border border-[var(--color-border)] bg-[rgba(225,6,0,0.18)] px-3 py-2 text-sm text-[var(--color-text)]">{error}</p>
              ) : null}

              <Button type="submit" disabled={loading} className="mt-1 h-11">
                {loading ? "Ingresando..." : "Entrar al dashboard"}
              </Button>
            </form>

            <div className="mt-5 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-muted)]">
              {isBootstrapRegistrationEnabled ? (
                <p>
                  Si todavia no creaste el admin inicial, puedes hacerlo desde{" "}
                  <Link href="/register" className="font-semibold text-[var(--color-text)] underline-offset-4 hover:underline">
                    configurar cuenta
                  </Link>
                  .
                </p>
              ) : (
                <p>El registro inicial esta deshabilitado en este entorno. Contacta al administrador principal.</p>
              )}
            </div>
          </Card>
        </div>
      </Container>
    </main>
  )
}
