"use client"

import { useEffect, useRef, type FormEvent, type FormHTMLAttributes, type ReactNode } from "react"

import { cn } from "@/lib/cn"

type FilterBarProps = FormHTMLAttributes<HTMLFormElement> & {
  fields: ReactNode
  actions?: ReactNode
  dense?: boolean
  instant?: boolean
  textInputDebounceMs?: number
}

export default function FilterBar({
  className,
  fields,
  actions,
  dense = false,
  instant = false,
  textInputDebounceMs = 350,
  ...props
}: FilterBarProps) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const textInputTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (textInputTimerRef.current) {
        clearTimeout(textInputTimerRef.current)
      }
    }
  }, [])

  function requestFormSubmit() {
    formRef.current?.requestSubmit()
  }

  function handleChangeCapture(event: FormEvent<HTMLFormElement>) {
    if (!instant) return

    const target = event.target
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLSelectElement) &&
      !(target instanceof HTMLTextAreaElement)
    ) {
      return
    }

    if (!target.name || target.disabled) return

    if (target instanceof HTMLInputElement) {
      const isTextLikeInput = ["search", "text", "number", "tel", "email"].includes(target.type)
      if (isTextLikeInput) {
        if (textInputTimerRef.current) {
          clearTimeout(textInputTimerRef.current)
        }

        textInputTimerRef.current = setTimeout(() => {
          requestFormSubmit()
        }, textInputDebounceMs)
        return
      }
    }

    requestFormSubmit()
  }

  return (
    <form
      ref={formRef}
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]",
        dense ? "p-3 md:p-3.5" : "p-4 md:p-6",
        className,
      )}
      onChangeCapture={handleChangeCapture}
      {...props}
    >
      <div className={cn("grid md:grid-cols-2 xl:grid-cols-5", dense ? "gap-2.5" : "gap-3")}>
        {fields}
      </div>
      {actions ? (
        <div className={cn("flex flex-wrap items-center", dense ? "mt-3 gap-2" : "mt-4 gap-3")}>
          {actions}
        </div>
      ) : null}
    </form>
  )
}
