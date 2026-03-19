import type { SelectHTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export default function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[#3a3d44] focus:ring-2 focus:ring-[rgba(225,6,0,0.22)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}
