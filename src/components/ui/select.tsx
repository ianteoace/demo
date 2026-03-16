import type { SelectHTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export default function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500",
        className,
      )}
      {...props}
    />
  )
}
