import type { TextareaHTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[#3a3d44] focus:ring-2 focus:ring-[rgba(225,6,0,0.22)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}
