"use client"

import { useActionState, useEffect, useRef } from "react"

import { Button, Card, Input, Textarea } from "@/components/ui"

import { createLeadAction } from "./actions"
import { EMPTY_LEAD_ACTION_STATE } from "./lead-action-state"

type LeadFormProps = {
  propertyId: string
}

export default function LeadForm({ propertyId }: LeadFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    createLeadAction.bind(null, propertyId),
    EMPTY_LEAD_ACTION_STATE,
  )

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <Card className="p-5 md:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Consultar por esta propiedad</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Completa tus datos y un asesor comercial te contacta en breve para coordinar la visita.
      </p>
      <p className="mt-1 text-xs text-zinc-500">Respuesta habitual dentro de las próximas horas hábiles.</p>

      <form ref={formRef} action={formAction} className="mt-4 grid gap-3">
        <Input type="text" name="name" placeholder="Nombre y apellido" maxLength={80} required />

        <Input type="email" name="email" placeholder="Email de contacto" maxLength={120} required />

        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <Textarea
          name="message"
          placeholder="Cuéntanos qué tipo de información necesitas"
          rows={5}
          minLength={10}
          maxLength={1500}
          required
        />

        {state.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {state.success}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? "Enviando consulta..." : "Solicitar asesoramiento"}
        </Button>
      </form>
    </Card>
  )
}
