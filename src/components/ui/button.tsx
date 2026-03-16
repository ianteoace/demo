import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "success"
  fullWidth?: boolean
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-700",
  secondary: "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950",
  ghost: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
  success: "bg-emerald-600 text-white hover:bg-emerald-500",
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
