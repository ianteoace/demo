import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/cn"

type SectionProps = HTMLAttributes<HTMLElement> & {
  title?: string
  description?: string
  actions?: ReactNode
  compact?: boolean
}

export default function Section({
  className,
  title,
  description,
  actions,
  compact,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(compact ? "mt-10" : "mt-14", className)} {...props}>
      {(title || description || actions) ? (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            {title ? (
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">{title}</h2>
            ) : null}
            {description ? <p className="mt-2 text-sm text-[var(--color-muted)] md:text-base">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  )
}
