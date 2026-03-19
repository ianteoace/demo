"use client"

import { useActionState, useEffect, useRef } from "react"

import { Button, Card, Input, Textarea } from "@/components/ui"
import { EMPTY_INQUIRY_ACTION_STATE } from "@/types/inquiry"

import { createInquiryAction } from "./actions"

type InquiryFormProps = {
  productId: string | null
}

export default function InquiryForm({ productId }: InquiryFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    createInquiryAction.bind(null, productId),
    EMPTY_INQUIRY_ACTION_STATE,
  )

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <Card className="p-5 md:p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text)]">Consulta comercial</h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Completa tus datos para recibir atencion mayorista personalizada.
      </p>

      <form ref={formRef} action={formAction} className="mt-4 grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text)]">Nombre y apellido</span>
          <Input type="text" name="name" placeholder="Nombre y apellido" maxLength={80} required />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text)]">Empresa (opcional)</span>
          <Input type="text" name="company" placeholder="Empresa (opcional)" maxLength={120} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text)]">Telefono de contacto</span>
          <Input type="text" name="phone" placeholder="Telefono de contacto" maxLength={30} required />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text)]">Email (opcional)</span>
          <Input type="email" name="email" placeholder="Email (opcional)" maxLength={120} />
        </label>

        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text)]">Mensaje</span>
          <Textarea
            name="message"
            placeholder="Contanos volumen estimado, frecuencia y necesidad comercial"
            rows={5}
            minLength={10}
            maxLength={1500}
            required
          />
        </label>

        {state.error ? (
          <p className="rounded-lg border border-[var(--color-border)] bg-[rgba(225,6,0,0.18)] p-3 text-sm text-[var(--color-text)]">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-lg border border-[var(--color-success)]/45 bg-[rgba(22,128,59,0.2)] p-3 text-sm text-[var(--color-text)]">
            {state.success}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? "Enviando consulta..." : "Enviar consulta"}
        </Button>
      </form>
    </Card>
  )
}
