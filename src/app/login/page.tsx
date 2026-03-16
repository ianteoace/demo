"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useMemo, useState } from "react"

import { Button, Card, Container, Input } from "@/components/ui"

function getSafeCallbackUrl(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith("/")) return null
  return value
}

export default function LoginPage() {
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
      setError("Email o contraseña incorrectos.")
      return
    }

    const targetUrl = getSafeCallbackUrl(response.url) || callbackUrl || "/dashboard"
    router.push(targetUrl)
    router.refresh()
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-zinc-50 via-white to-zinc-100 py-10 md:py-14">
      <Container size="public">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-stretch">
          <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-900 p-6 text-white md:p-10">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-zinc-700/40 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" aria-hidden="true" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">Inmobiliaria SaaS</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Panel comercial para gestionar propiedades y leads en un solo lugar
              </h1>
              <p className="mt-4 max-w-xl text-sm text-zinc-200 md:text-base">
                Publica propiedades, administra imagenes y responde consultas con una operacion ordenada y profesional.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">Inventario</p>
                  <p className="mt-2 text-sm font-medium text-white">Propiedades publicadas y borradores</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">Leads</p>
                  <p className="mt-2 text-sm font-medium text-white">Seguimiento comercial con estado real</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">Publico</p>
                  <p className="mt-2 text-sm font-medium text-white">Catalogo y fichas optimizadas</p>
                </div>
              </div>
            </div>
          </section>

          <Card className="self-center border-zinc-200 p-6 shadow-sm md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Acceso admin</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Iniciar sesion</h2>
              <p className="mt-2 text-sm text-zinc-600">Ingresa con tu cuenta para acceder al dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              {infoMessage ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {infoMessage}
                </p>
              ) : null}

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-zinc-700">Email</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  placeholder="admin@inmobiliaria.com"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-zinc-700">Contrasena</span>
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
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              <Button type="submit" disabled={loading} className="mt-1 h-11">
                {loading ? "Ingresando..." : "Entrar al dashboard"}
              </Button>
            </form>

            <div className="mt-5 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
              <p>
                Si todavia no creaste el admin inicial, puedes hacerlo desde{" "}
                <Link href="/register" className="font-semibold text-zinc-800 underline-offset-4 hover:underline">
                  configurar cuenta
                </Link>
                .
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  )
}
