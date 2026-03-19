import type { HTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type CardProps = HTMLAttributes<HTMLDivElement>

export default function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]", className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("p-5 md:p-6", className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-5 md:p-6", className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn("p-5 pt-0 md:p-6 md:pt-0", className)} {...props} />
}
