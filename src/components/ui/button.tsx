import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "success"
  fullWidth?: boolean
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
  secondary: "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[#3a3d44] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
  ghost: "text-[var(--color-text)] hover:bg-[var(--color-surface)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
  success: "bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-success)]",
}

export default function Button({
  className,
  variant = "primary",
  fullWidth,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  )
}
