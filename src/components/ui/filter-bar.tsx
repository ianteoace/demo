import type { FormHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/cn"

type FilterBarProps = FormHTMLAttributes<HTMLFormElement> & {
  fields: ReactNode
  actions?: ReactNode
}

export default function FilterBar({ className, fields, actions, ...props }: FilterBarProps) {
  return (
    <form
      className={cn("rounded-2xl border border-zinc-200 bg-white p-4 md:p-6", className)}
      {...props}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{fields}</div>
      {actions ? <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </form>
  )
}
